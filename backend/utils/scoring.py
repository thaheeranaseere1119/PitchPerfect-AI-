"""
scoring.py
Computes per-dimension scores and generates deductions + suggestions.
"""

FILLER_WORDS = ["um", "uh", "like", "basically", "you know", "literally"]

IDEAL_WPM_LOW = 120
IDEAL_WPM_HIGH = 160


# ---------------------------------------------------------------------------
# Individual score helpers
# ---------------------------------------------------------------------------

def fluency_score(filler_count: int, word_count: int) -> int:
    """Penalise based on filler word ratio."""
    if word_count == 0:
        return 50
    ratio = filler_count / max(word_count, 1)
    # Each 1% filler ratio costs ~5 points
    penalty = ratio * 500
    return max(0, min(100, int(100 - penalty)))


def pace_score(wpm: float) -> int:
    """Ideal 120–160 WPM, penalise outside range."""
    if IDEAL_WPM_LOW <= wpm <= IDEAL_WPM_HIGH:
        return 100
    elif wpm < IDEAL_WPM_LOW:
        diff = IDEAL_WPM_LOW - wpm
        return max(0, int(100 - diff * 1.2))
    else:
        diff = wpm - IDEAL_WPM_HIGH
        return max(0, int(100 - diff * 1.2))


def volume_score(rms_energy: float) -> int:
    """Map RMS energy to 0–100.  Typical speech RMS ≈ 0.02–0.15."""
    # Normalise to [0, 100]
    normalised = min(rms_energy / 0.1, 1.0)  # clamp at 0.1 as "good"
    if normalised < 0.1:
        return int(normalised * 300)   # very quiet → steep penalty
    return int(40 + normalised * 60)


def tone_score(pitch_std: float) -> int:
    """Lower pitch variation → more stable tone → higher score."""
    # pitch_std in Hz, typical stable speaker ~10–30 Hz std
    if pitch_std == 0:
        return 70  # no voiced segments detected
    normalised = min(pitch_std / 60.0, 1.0)
    return max(0, int(100 - normalised * 60))


def confidence_score(model_prob: float) -> int:
    """Convert model confidence probability (class 1 = confident) to 0–100."""
    return int(model_prob * 100)


def overall_score(fluency: int, pace: int, volume: int, tone: int, confidence: int) -> int:
    """Weighted average."""
    return int(
        fluency * 0.25
        + pace * 0.20
        + volume * 0.20
        + tone * 0.15
        + confidence * 0.20
    )


# ---------------------------------------------------------------------------
# Filler word counting
# ---------------------------------------------------------------------------

def count_fillers(transcript: str) -> dict:
    """Return a dict of {filler_word: count} for found fillers using regex for accuracy."""
    import re
    counts = {}
    for word in FILLER_WORDS:
        # Use regex \b for word boundaries, handling punctuation and start/end of string
        pattern = rf"\b{re.escape(word)}\b"
        matches = re.findall(pattern, transcript, re.IGNORECASE)
        if matches:
            counts[word] = len(matches)
    return counts


def count_words(transcript: str) -> int:
    return len(transcript.split())


# ---------------------------------------------------------------------------
# Stress detection
# ---------------------------------------------------------------------------

def stress_level(pitch_std: float, rms_energy: float, model_class: int) -> tuple:
    """
    Returns (level_str, score_int) where level_str ∈ {"Low", "Medium", "High"}.
    """
    stress_pts = 0

    # High pitch variation → stress
    if pitch_std > 40:
        stress_pts += 40
    elif pitch_std > 20:
        stress_pts += 20

    # Low energy → stress
    if rms_energy < 0.02:
        stress_pts += 30
    elif rms_energy < 0.05:
        stress_pts += 15

    # Model predicted nervous
    if model_class == 0:
        stress_pts += 30

    stress_pts = min(100, stress_pts)

    if stress_pts < 35:
        level = "Low"
    elif stress_pts < 65:
        level = "Medium"
    else:
        level = "High"

    return level, stress_pts


# ---------------------------------------------------------------------------
# Deductions & suggestions
# ---------------------------------------------------------------------------

def generate_deductions_and_suggestions(
    filler_counts: dict,
    pace: int,
    volume: int,
    tone: int,
    confidence: int,
    wpm: float,
    stress: str,
) -> tuple:
    """
    Returns (deductions, suggestions) where suggestions is a list of dicts:
    { "category": str, "suggestion": str, "expert_tip": str, "icon": str }
    """
    deductions = []
    suggestions = []

    total_fillers = sum(filler_counts.values())
    if total_fillers >= 5:
        deductions.append("Too many filler words detected")
        suggestions.append({
            "category": "Fluency",
            "suggestion": "Replace filler words with silent pauses.",
            "expert_tip": "Instead of using 'um' or 'uh', embrace the silence. It gives you time to think and helps the audience absorb your points.",
            "icon": "🗣️"
        })
    elif total_fillers >= 2:
        deductions.append("Some filler words detected")
        suggestions.append({
            "category": "Fluency",
            "suggestion": "Reduce usage of filler words to sound more polished.",
            "expert_tip": "Record yourself speaking for 1 minute every day and count your fillers. Awareness is the first step to elimination.",
            "icon": "🗣️"
        })

    if wpm < IDEAL_WPM_LOW:
        deductions.append("Speaking pace is quite slow")
        suggestions.append({
            "category": "Pacing",
            "suggestion": "Increase your speed to 120–160 WPM for better engagement.",
            "expert_tip": "If you tend to talk too slowly, try practicing with a metronome or reading along with a professional speech.",
            "icon": "⚡"
        })
    elif wpm > IDEAL_WPM_HIGH:
        deductions.append("Speaking pace is too fast")
        suggestions.append({
            "category": "Pacing",
            "suggestion": "Slow down slightly for better clarity.",
            "expert_tip": "Pretend your audience is hard of hearing. This automatically forces you to enunciate more clearly and slow down naturally.",
            "icon": "⚡"
        })

    if volume < 50:
        deductions.append("Voice projection is low")
        suggestions.append({
            "category": "Confidence",
            "suggestion": "Project your voice as if speaking to the back of the room.",
            "expert_tip": "Practice 'belly breathing' (diaphragmatic breathing). This provides a steady stream of air to support a louder, more confident voice.",
            "icon": "💪"
        })

    if tone < 60:
        deductions.append("Monotone pitch detected")
        suggestions.append({
            "category": "Vocal Variety",
            "suggestion": "Vary your pitch to emphasize your key points.",
            "expert_tip": "Consciously raise your pitch for questions or excitement, and lower it for gravity. Without inflection, speech sounds robotic.",
            "icon": "🎵"
        })

    if confidence < 60:
        deductions.append("Low confidence markers detected")
        suggestions.append({
            "category": "Confidence",
            "suggestion": "Use 'Power Posing' before you start speaking.",
            "expert_tip": "Acting confident naturally affects your vocal tone. Even if you're nervous, using an open posture improves how you sound.",
            "icon": "🦁"
        })

    if stress == "High":
        deductions.append("High stress markers in vocal patterns")
        suggestions.append({
            "category": "Stress Management",
            "suggestion": "Practice Box Breathing techniques before your next session.",
            "expert_tip": "Inhale for 4s, hold 4s, exhale 4s, hold 4s. This recalibrates your nervous system and helps you sound much calmer.",
            "icon": "🧘"
        })

    # Always add a general mastery tip if no major issues
    if len(suggestions) < 3:
        suggestions.append({
            "category": "Clarity",
            "suggestion": "Focus on clear enunciation of consonants.",
            "expert_tip": "Try 'tongue twisters' before a speech to warm up your articulators (lips, teeth, tongue).",
            "icon": "✨"
        })

    return deductions, suggestions
