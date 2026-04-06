"""
feature_extraction.py
Extracts audio features consistent with the notebook's pipeline.
"""
import numpy as np
import librosa


def extract_features(file_path: str, n_mfcc: int = 13) -> np.ndarray:
    """
    Load audio and extract:
      - 13 MFCC means
    Returns a flat numpy array of shape (13,).
    """
    audio, sr = librosa.load(file_path, sr=None, duration=180)

    # MFCCs
    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=n_mfcc)
    mfcc_mean = np.mean(mfcc.T, axis=0)  # (13,)

    return mfcc_mean


def extract_audio_stats(file_path: str):
    """
    Returns additional audio statistics used for scoring:
      - rms_energy  : float
      - pitch_std   : float  (standard deviation of fundamental frequency)
      - zcr_mean    : float  (zero crossing rate — proxy for noisiness)
    """
    audio, sr = librosa.load(file_path, sr=None, duration=180)

    # RMS energy
    rms = librosa.feature.rms(y=audio)[0]
    rms_energy = float(np.mean(rms))

    # Pitch (fundamental frequency via pyin)
    try:
        f0, voiced_flag, _ = librosa.pyin(
            audio, fmin=librosa.note_to_hz("C2"), fmax=librosa.note_to_hz("C7")
        )
        voiced_f0 = f0[voiced_flag] if voiced_flag is not None else np.array([])
        pitch_std = float(np.std(voiced_f0)) if len(voiced_f0) > 1 else 0.0
    except Exception:
        pitch_std = 0.0

    # Zero crossing rate
    zcr = librosa.feature.zero_crossing_rate(y=audio)[0]
    zcr_mean = float(np.mean(zcr))

    return {
        "rms_energy": rms_energy,
        "pitch_std": pitch_std,
        "zcr_mean": zcr_mean,
        "duration": len(audio) / sr,
    }
