import { Link, useNavigate } from 'react-router-dom'
import ScoreCard from '../components/ScoreCard'
import FillerBarChart from '../components/FillerBarChart'
import PitchLineChart from '../components/PitchLineChart'
import TranscriptViewer from '../components/TranscriptViewer'
import StressGauge from '../components/StressGauge'
import ExpertAdvice from '../components/ExpertAdvice'

// Mock result for demo when no result available
const DEMO = {
  transcript: "Um, so basically I wanted to talk about, like, the importance of clear communication in professional settings. You know, when we speak with confidence, uh, people tend to listen more carefully.",
  emotion: "nervous",
  stress_level: "Medium",
  stress_score: 55,
  fillers: { um: 2, like: 1, basically: 1, "you know": 1, uh: 1 },
  pause_count: 4,
  wpm: 118,
  scores: { fluency: 65, pace: 82, volume: 70, tone: 74, confidence: 60, overall: 70 },
  deductions: ["Some filler words detected", "Speaking pace is slightly slow"],
  suggestions: [
    {
      category: "Fluency",
      suggestion: "Reduce filler word usage.",
      expert_tip: "Try practicing with a metronome to find a rhythm that eliminates 'ums'.",
      icon: "🗣️"
    },
    {
      category: "Pacing",
      suggestion: "Maintain steady speed.",
      expert_tip: "Ideally, aim for 120-160 WPM for maximum impact.",
      icon: "⚡"
    },
    {
      category: "Confidence",
      suggestion: "Project your voice.",
      expert_tip: "Stand up straight and project to the back of the room.",
      icon: "💪"
    }
  ],
}

function OverallScoreRing({ score }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const shadow = score >= 75 ? 'shadow-emerald-500/30' : score >= 50 ? 'shadow-amber-500/30' : 'shadow-red-500/30'
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Work'
  const circumference = 2 * Math.PI * 54
  const strokeDash = (score / 100) * circumference

  return (
    <div className={`relative flex flex-col items-center justify-center w-44 h-44 rounded-full glass-card shadow-2xl ${shadow}`}>
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="text-5xl font-black text-white z-10">{score}</div>
      <div className="text-xs uppercase tracking-widest font-semibold z-10" style={{ color }}>{label}</div>
      <div className="text-slate-500 text-xs z-10">Overall</div>
    </div>
  )
}

export default function ResultsPage({ result }) {
  const navigate = useNavigate()
  const data = result || DEMO

  const { scores, emotion, stress_level, stress_score, fillers, pause_count, wpm, transcript, deductions, suggestions } = data

  const emotionEmoji = {
    confident: '😊', nervous: '😰', neutral: '😐', unknown: '🤔'
  }[emotion] ?? '🎙️'

  return (
    <main className="min-h-screen px-6 pt-24 pb-16">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl font-black gradient-text">Your Analysis</h1>
          <p className="text-slate-400 mt-2">Here's a detailed breakdown of your speech performance</p>
        </div>

        {/* Top Section: Overall Score + Emotion + Stress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
          {/* Overall Score */}
          <div className="flex flex-col items-center justify-center gap-4 glass-card p-8">
            <OverallScoreRing score={scores.overall} />
          </div>

          {/* Emotion */}
          <div className="glass-card p-6 flex flex-col items-center justify-center gap-4 text-center">
            <div className="text-6xl">{emotionEmoji}</div>
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-1">Detected Emotion</div>
              <div className="text-3xl font-black text-white capitalize">{emotion}</div>
            </div>
            <div className="w-full pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-200">{wpm}</div>
                <div className="text-xs text-slate-500 mt-0.5">Words/Min</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-200">{pause_count}</div>
                <div className="text-xs text-slate-500 mt-0.5">Pauses</div>
              </div>
            </div>
          </div>

          {/* Stress */}
          <div className="glass-card p-6 flex flex-col justify-between gap-6">
            <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold">Stress Analysis</div>
            <StressGauge level={stress_level} score={stress_score} />
            <p className="text-xs text-slate-500 leading-relaxed">
              {stress_level === 'Low'
                ? '✓ Your vocal patterns indicate a calm, relaxed delivery.'
                : stress_level === 'Medium'
                  ? '⚠ Some stress markers detected. Practice deep breathing before speaking.'
                  : '⚠ High stress detected. Focus on relaxation techniques and paced breathing.'}
            </p>
          </div>
        </div>

        {/* Score Cards */}
        <div>
          <h2 className="text-sm uppercase tracking-widest text-slate-500 font-semibold mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ScoreCard label="Fluency" score={scores.fluency} icon="🗣️" delay={0} />
            <ScoreCard label="Pace" score={scores.pace} icon="⚡" delay={80} />
            <ScoreCard label="Volume" score={scores.volume} icon="🔊" delay={160} />
            <ScoreCard label="Tone" score={scores.tone} icon="🎵" delay={240} />
            <ScoreCard label="Confidence" score={scores.confidence} icon="💪" delay={320} />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <span>🔤</span> Filler Word Frequency
            </h3>
            <FillerBarChart fillers={fillers} />
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <span>〰️</span> Pitch Variation
            </h3>
            <PitchLineChart pitchVariation={scores.tone ? (100 - scores.tone) / 100 : 0.3} />
          </div>
        </div>

        {/* Transcript */}
        <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <span>📝</span> Transcript
            <span className="ml-2 text-xs text-slate-500 font-normal">
              — filler words highlighted
              <span className="inline-block w-3 h-3 rounded-sm bg-red-500/25 border border-red-500/30 ml-1 align-middle" />
            </span>
          </h3>
          <TranscriptViewer transcript={transcript} fillers={fillers} />
        </div>

        {/* Expert Advice & Recommendations */}
        <div className="animate-fade-in space-y-6" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Expert Recommendations</h2>
              <p className="text-slate-400 text-sm">Actionable steps to master your speech performance</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Tailored for you</span>
            </div>
          </div>
          
          <ExpertAdvice suggestions={suggestions} />
          
          {/* Deductions / Areas for Improvement */}
          {deductions.length > 0 && (
            <div className="glass-card p-6 border-l-4 border-l-red-500/50">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <span>⚠️</span> Areas for Improvement
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                {deductions.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-red-400 mt-0.5 shrink-0">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Record Again */}
        <div className="flex justify-center pb-4 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <Link to="/record" id="record-again-btn">
            <button className="btn-primary flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a5 5 0 015 5v6a5 5 0 01-10 0V6a5 5 0 015-5z"/>
                <path d="M3.5 11a1 1 0 012 0 6.5 6.5 0 0013 0 1 1 0 012 0 8.5 8.5 0 01-8 8.47V22h3a1 1 0 010 2H8a1 1 0 010-2h3v-2.53A8.5 8.5 0 013.5 11z"/>
              </svg>
              Record Again
            </button>
          </Link>
        </div>

      </div>
    </main>
  )
}
