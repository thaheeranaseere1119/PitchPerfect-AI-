import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

function SessionCard({ session }) {
  const overall = session.scores?.overall ?? 0
  const color = overall >= 75 ? 'text-emerald-400' : overall >= 50 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="glass-card p-4 flex items-center gap-4 hover:bg-white/10 transition-all duration-200">
      <div className={`text-3xl font-black ${color} w-16 text-center tabular-nums`}>{overall}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-200 truncate">
          {session.emotion ? `${session.emotion.charAt(0).toUpperCase() + session.emotion.slice(1)} mood` : 'Speech analysis'}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">{session.date}</div>
      </div>
      <div className="text-xs text-slate-500 shrink-0">{session.wpm} WPM</div>
    </div>
  )
}

export default function HomePage() {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('pitchperfect_sessions') || '[]')
      setSessions(stored.slice(0, 5))
    } catch {
      setSessions([])
    }
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Hero */}
      <div className="relative z-10 text-center max-w-3xl mx-auto animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold
                        bg-brand-500/15 border border-brand-500/30 text-brand-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
          AI-Powered Speech Analysis
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-4">
          <span className="gradient-text">PitchPerfect</span>
          <span className="text-white"> AI</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-slate-400 mb-12 leading-relaxed">
          Speak Smart. Sound Confident.
          <br />
          <span className="text-slate-500 text-base">
            Record your speech, and get instant AI feedback on fluency, tone, pace, and confidence.
          </span>
        </p>

        {/* CTA */}
        <Link to="/record" id="hero-start-btn">
          <button className="btn-primary text-lg px-12 py-5 flex items-center gap-3 mx-auto group">
            <span className="w-6 h-6 flex items-center justify-center">
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a5 5 0 015 5v6a5 5 0 01-10 0V6a5 5 0 015-5z"/>
                <path d="M3.5 11a1 1 0 012 0 6.5 6.5 0 0013 0 1 1 0 012 0 8.5 8.5 0 01-8 8.47V22h3a1 1 0 010 2H8a1 1 0 010-2h3v-2.53A8.5 8.5 0 013.5 11z"/>
              </svg>
            </span>
            Start Recording
          </button>
        </Link>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-12">
          {['Whisper AI Transcription', 'Emotion Detection', 'Filler Word Analysis', 'Real-time Scoring'].map(f => (
            <span key={f} className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-slate-400">
              ✦ {f}
            </span>
          ))}
        </div>
      </div>

      {/* Previous sessions */}
      {sessions.length > 0 && (
        <div className="relative z-10 w-full max-w-lg mt-20 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-sm uppercase tracking-widest text-slate-500 font-semibold mb-4">Previous Sessions</h2>
          <div className="space-y-2">
            {sessions.map((s, i) => (
              <SessionCard key={i} session={s} />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
