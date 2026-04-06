export default function ExpertAdvice({ suggestions }) {
  if (!suggestions || suggestions.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {suggestions.map((item, i) => (
        <div 
          key={i} 
          className="glass-card p-6 flex flex-col gap-4 animate-fade-in border-l-4 border-l-brand-500"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon || '💡'}</span>
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                {item.category}
              </span>
            </div>
            <div className="px-2 py-1 rounded-md bg-brand-500/10 text-brand-400 text-[10px] font-black uppercase tracking-tighter">
              Recommended
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold text-lg leading-tight">
              {item.suggestion}
            </h4>
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              <span className="text-brand-400 font-semibold italic mr-1">Expert Tip:</span>
              {item.expert_tip}
            </p>
          </div>

          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-medium italic">Actionable Insight</span>
            <button className="text-xs text-brand-400 font-bold hover:text-brand-300 transition-colors flex items-center gap-1 group">
              Learn more
              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
