import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  { label: 'Normalizing audio', icon: '🎵', delay: 0 },
  { label: 'Extracting features', icon: '📊', delay: 600 },
  { label: 'Running ML model', icon: '🤖', delay: 1200 },
  { label: 'Transcribing speech', icon: '💬', delay: 1800 },
  { label: 'Calculating scores', icon: '⭐', delay: 2400 },
]

export default function ProcessingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12">
      <div className="fixed inset-0 bg-gradient-radial from-brand-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-10 max-w-sm w-full text-center">
        {/* Spinner */}
        <div className="relative w-32 h-32">
          <div className="absolute inset-0 rounded-full border-4 border-white/5" />
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-500 border-r-accent-500 border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-4 rounded-full border-4 border-t-accent-400 border-r-transparent border-b-brand-400 border-l-transparent animate-spin-slow" style={{ animationDirection: 'reverse' }} />
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🎙️</div>
        </div>

        {/* Text */}
        <div>
          <h1 className="text-2xl font-black text-white">Analyzing your speech…</h1>
          <p className="text-slate-400 text-sm mt-2">This may take 15–30 seconds</p>
        </div>

        {/* Steps */}
        <div className="w-full space-y-3">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="glass-card px-4 py-3 flex items-center gap-3 animate-fade-in"
              style={{ animationDelay: `${step.delay}ms` }}
            >
              <span className="text-xl">{step.icon}</span>
              <span className="text-sm text-slate-300 font-medium">{step.label}</span>
              <div className="ml-auto">
                <div className="w-4 h-4 rounded-full border-2 border-brand-500/50 border-t-brand-400 animate-spin" 
                     style={{ animationDelay: `${step.delay}ms` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
