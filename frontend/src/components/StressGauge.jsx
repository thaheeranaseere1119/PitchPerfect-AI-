/**
 * StressGauge — displays stress level as a colour-coded progress bar with label.
 */
export default function StressGauge({ level, score }) {
  const colorClass =
    level === 'Low'    ? 'bg-emerald-500' :
    level === 'Medium' ? 'bg-amber-500' :
                         'bg-red-500'

  const textColor =
    level === 'Low'    ? 'text-emerald-400' :
    level === 'Medium' ? 'text-amber-400' :
                         'text-red-400'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm font-medium">Stress Level</span>
        <span className={`text-sm font-bold ${textColor}`}>{level} ({score}%)</span>
      </div>

      {/* Track */}
      <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${colorClass}`}
          style={{ width: `${score}%` }}
        />
        {/* Gradient overlay for glossy effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-full pointer-events-none" />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-slate-600">
        <span>0% — Calm</span>
        <span>100% — High Stress</span>
      </div>
    </div>
  )
}
