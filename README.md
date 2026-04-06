# PitchPerfect AI — Speech Confidence Analyzer

> 🎙️ AI-powered speech analysis platform built with Flask, React, Whisper, and scikit-learn.

---

## 🗂 Project Structure

```
pitchperfect/
├── backend/
│   ├── app.py                    # Flask API
│   ├── requirements.txt
│   ├── model/
│   │   ├── generate_model.py     # Run once to generate model.pkl + scaler.pkl
│   │   ├── model.pkl             # Generated Decision Tree classifier
│   │   └── scaler.pkl            # Generated StandardScaler
│   └── utils/
│       ├── feature_extraction.py # MFCC + audio stats
│       └── scoring.py            # Score computation + suggestions
└── frontend/
    ├── src/
    │   ├── pages/                # HomePage, RecordingPage, ProcessingPage, ResultsPage
    │   ├── components/           # Navbar, ScoreCard, charts, etc.
    │   └── index.css             # Global Tailwind styles
    └── package.json
```

---

## ⚙️ Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- **FFmpeg** (required by pydub)
  ```bash
  brew install ffmpeg      # macOS
  sudo apt install ffmpeg  # Ubuntu/Debian
  ```

---

### Backend

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Generate the ML model (only needed once)
python model/generate_model.py

# Start the Flask server
python app.py
```

The backend runs on **http://localhost:5000**

> ⚠️ On first run, Whisper will download the `base` model (~140 MB). Ensure internet access.

---

### Frontend

```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite dev server
npm run dev
```

The frontend runs on **http://localhost:5173**

---

## 🚀 Usage

1. Open **http://localhost:5173** in your browser
2. Click **Start Recording**
3. Speak for up to 3 minutes
4. Click **Stop & Analyze**
5. View your detailed results page

---

## 📡 API

### `POST /analyze`

**Request:** `multipart/form-data` with field `audio` (WAV/WebM file)

**Response:**
```json
{
  "transcript": "...",
  "emotion": "nervous",
  "stress_level": "Medium",
  "stress_score": 55,
  "fillers": { "um": 2, "like": 1 },
  "pause_count": 4,
  "wpm": 130,
  "scores": {
    "fluency": 72, "pace": 85, "volume": 75, "tone": 80, "confidence": 68, "overall": 76
  },
  "deductions": ["Some filler words detected"],
  "suggestions": ["Reduce filler word usage", "Maintain consistent pace"]
}
```

---

## 🤖 ML Model

The model (`model.pkl`) is a `DecisionTreeClassifier` trained on 13 MFCC features:

| Class | Label |
|---|---|
| 0 | nervous |
| 1 | confident |

Run `python backend/model/generate_model.py` to regenerate the model.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Charts | Chart.js + react-chartjs-2 |
| Backend | Python Flask + Flask-CORS |
| ML | scikit-learn DecisionTreeClassifier |
| Speech-to-Text | OpenAI Whisper (base model) |
| Audio Processing | librosa, pydub |
# PitchPerfect-AI-
# PitchPerfect-AI-
