"""
app.py
PitchPerfect AI — Flask backend
POST /analyze  →  accepts a WAV/audio file, returns JSON analysis
"""
import os
import pickle
import tempfile
import logging
from pathlib import Path

import numpy as np
import soundfile as sf
import whisper
from flask import Flask, request, jsonify
from flask_cors import CORS
from pydub import AudioSegment

from utils.feature_extraction import extract_features, extract_audio_stats
from utils.scoring import (
    count_fillers,
    count_words,
    fluency_score,
    pace_score,
    volume_score,
    tone_score,
    confidence_score,
    overall_score,
    stress_level,
    generate_deductions_and_suggestions,
)

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).parent

# Load ML model
MODEL_PATH = BASE_DIR / "model" / "model.pkl"
SCALER_PATH = BASE_DIR / "model" / "scaler.pkl"

try:
    with open(MODEL_PATH, "rb") as f:
        clf = pickle.load(f)
    logger.info("✅ Loaded model.pkl")
except FileNotFoundError:
    logger.error("❌ model.pkl not found — run: python backend/model/generate_model.py")
    clf = None

try:
    with open(SCALER_PATH, "rb") as f:
        scaler = pickle.load(f)
    logger.info("✅ Loaded scaler.pkl")
except FileNotFoundError:
    logger.warning("⚠️  scaler.pkl not found — features will not be scaled")
    scaler = None

# Load Whisper model (downloads ~460 MB on first run)
logger.info("Loading Whisper model (this may take a moment on first run)...")
try:
    whisper_model = whisper.load_model("base")
    logger.info("✅ Whisper model loaded")
except Exception as e:
    logger.error(f"❌ Could not load Whisper: {e}")
    whisper_model = None

# Emotion map: model class → label
EMOTION_MAP = {0: "nervous", 1: "confident"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def normalize_audio(input_path: str, output_path: str, original_filename: str = '') -> None:
    """
    Convert any audio to a normalised mono 16kHz WAV.
    Strategy:
      1. Try soundfile (fast, no ffmpeg, handles WAV/OGG/FLAC).
      2. If on macOS, try afconvert (built-in, handles WebM/MP3/etc).
      3. Fallback to pydub (needs ffmpeg for MP3/WebM).
    """
    ext = original_filename.lower().rsplit('.', 1)[-1] if original_filename else ''

    # --- 1. Try librosa + soundfile first (works for WAV, OGG, FLAC) ---
    e_lib = e_af = e_pydub = "Not attempted"
    try:
        import librosa
        audio, sr = librosa.load(input_path, sr=16000, mono=True)
        sf.write(output_path, audio, 16000, subtype='PCM_16')
        logger.info(f'Normalised via librosa (sr={sr})')
        return
    except Exception as e:
        e_lib = str(e)
        logger.warning(f'librosa load failed ({e_lib}), trying macOS afconvert...')

    # --- 2. Try macOS afconvert (built-in, no ffmpeg needed) ---
    try:
        import subprocess
        # afconvert -f 'WAVE' -d LEI16@16000 input.webm output.wav
        cmd = ['afconvert', '-f', 'WAVE', '-d', 'LEI16@16000', input_path, output_path]
        subprocess.run(cmd, check=True, capture_output=True)
        logger.info('Normalised via macOS afconvert')
        return
    except Exception as e:
        e_af = str(e)
        logger.warning(f'afconvert failed ({e_af}), trying pydub...')

    # --- 3. Fallback: pydub + ffmpeg (needed for MP3 / WebM if on non-mac or afconvert fails) ---
    try:
        audio = AudioSegment.from_file(input_path)
        audio = audio.set_channels(1).set_frame_rate(16000).set_sample_width(2)
        audio.export(output_path, format='wav')
        logger.info('Normalised via pydub')
        return
    except Exception as e:
        e_pydub = str(e)
        raise RuntimeError(
            f'Could not decode audio. '
            f'Please install FFmpeg or ensure you are on macOS with afconvert.\n'
            f'librosa error: {e_lib}\nafconvert error: {e_af}\npydub error: {e_pydub}'
        )


def compute_wpm(transcript: str, duration_seconds: float) -> float:
    """Words per minute based on transcript and audio duration."""
    if duration_seconds <= 0:
        return 0.0
    words = count_words(transcript)
    return round(words / (duration_seconds / 60), 1)


def estimate_pauses(audio_path: str, silence_thresh: float = -35) -> int:
    """Estimate number of pauses using pydub silence detection."""
    try:
        from pydub.silence import detect_silence
        audio = AudioSegment.from_wav(audio_path)
        silences = detect_silence(audio, min_silence_len=500, silence_thresh=silence_thresh)
        return len(silences)
    except Exception:
        return 0


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": clf is not None,
        "whisper_loaded": whisper_model is not None,
    }), 200


@app.route("/analyze", methods=["POST"])
def analyze():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files["audio"]

    with tempfile.TemporaryDirectory() as tmp_dir:
        # Save uploaded file with original extension so librosa can detect format
        original_filename = audio_file.filename or 'audio'
        ext = original_filename.rsplit('.', 1)[-1].lower() if '.' in original_filename else 'webm'
        raw_path = os.path.join(tmp_dir, f"raw_audio.{ext}")
        norm_path = os.path.join(tmp_dir, "normalized.wav")

        audio_file.save(raw_path)

        # Normalize
        try:
            normalize_audio(raw_path, norm_path, original_filename)
        except Exception as e:
            return jsonify({"error": f"Audio processing failed: {str(e)}"}), 422

        # ── Feature extraction ─────────────────────────────────────────────
        try:
            mfcc_features = extract_features(norm_path)  # shape (13,)
            audio_stats = extract_audio_stats(norm_path)
        except Exception as e:
            return jsonify({"error": f"Feature extraction failed: {str(e)}"}), 422

        # ── ML Prediction ──────────────────────────────────────────────────
        emotion = "unknown"
        model_class = 1
        model_prob = 0.7

        if clf is not None:
            features_2d = mfcc_features.reshape(1, -1)
            if scaler is not None:
                features_2d = scaler.transform(features_2d)
            prediction = clf.predict(features_2d)[0]
            proba = clf.predict_proba(features_2d)[0]
            model_class = int(prediction)
            model_prob = float(proba[1])  # probability of class 1 (confident)
            emotion = EMOTION_MAP.get(model_class, "unknown")

        # ── Whisper transcription ──────────────────────────────────────────
        transcript = ""
        if whisper_model is not None:
            try:
                # Use librosa to load normalized WAV as numpy array
                # This bypasses Whisper's internal FFmpeg call for transcription
                import librosa
                audio_np, _ = librosa.load(norm_path, sr=16000)
                result = whisper_model.transcribe(audio_np)
                transcript = result.get("text", "").strip()
                logger.info(f"✅ Transcribed: {transcript[:50]}...")
            except Exception as e:
                logger.warning(f"Whisper failed: {e}")
                transcript = ""

        # ── Text analysis ──────────────────────────────────────────────────
        filler_counts = count_fillers(transcript)
        total_fillers = sum(filler_counts.values())
        word_count = count_words(transcript)
        duration = audio_stats["duration"]
        wpm = compute_wpm(transcript, duration)
        pause_count = estimate_pauses(norm_path)

        # ── Scores ─────────────────────────────────────────────────────────
        rms_energy = audio_stats["rms_energy"]
        pitch_std = audio_stats["pitch_std"]

        s_fluency = fluency_score(total_fillers, word_count)
        s_pace = pace_score(wpm)
        s_volume = volume_score(rms_energy)
        s_tone = tone_score(pitch_std)
        s_confidence = confidence_score(model_prob)
        s_overall = overall_score(s_fluency, s_pace, s_volume, s_tone, s_confidence)

        # ── Stress detection ───────────────────────────────────────────────
        stress_lvl, stress_score = stress_level(pitch_std, rms_energy, model_class)

        # ── Deductions & suggestions ───────────────────────────────────────
        deductions, suggestions = generate_deductions_and_suggestions(
            filler_counts, s_pace, s_volume, s_tone, s_confidence, wpm, stress_lvl
        )

        # ── Response ───────────────────────────────────────────────────────
        response = {
            "transcript": transcript,
            "emotion": emotion,
            "stress_level": stress_lvl,
            "stress_score": stress_score,
            "fillers": filler_counts,
            "pause_count": pause_count,
            "wpm": wpm,
            "scores": {
                "fluency": s_fluency,
                "pace": s_pace,
                "volume": s_volume,
                "tone": s_tone,
                "confidence": s_confidence,
                "overall": s_overall,
            },
            "deductions": deductions,
            "suggestions": suggestions,
        }

        return jsonify(response), 200


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False, use_reloader=False)
