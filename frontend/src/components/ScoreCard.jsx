/**
 * ScoreCard — displays a single metric score with colour coding and label
 */
export default function ScoreCard({ label, score, icon, delay = 0 }) {
  const color = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'
  const ring  = score >= 75 ? 'ring-emerald-500/30' : score >= 50 ? 'ring-amber-500/30' : 'ring-red-500/30'
  const bg    = score >= 75 ? 'bg-emerald-500/10' : score >= 50 ? 'bg-amber-500/10' : 'bg-red-500/10'

  return (
    <div
      className="glass-card p-5 flex flex-col items-center gap-3 animate-fade-in hover:scale-105 transition-transform duration-200"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-12 h-12 rounded-xl ${bg} ring-2 ${ring} flex items-center justify-center text-2xl`}>
        {icon}
      </div>
      <div className={`text-4xl font-black ${color}`}>{score}</div>
      <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">{label}</div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            score >= 75 ? 'bg-emerald-400' : score >= 50 ? 'bg-amber-400' : 'bg-red-400'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
