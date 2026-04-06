const FILLERS = ['um', 'uh', 'like', 'basically', 'you know', 'literally']

/**
 * TranscriptViewer — renders the transcript with filler words highlighted in red.
 */
export default function TranscriptViewer({ transcript, fillers }) {
  if (!transcript) {
    return (
      <p className="text-slate-500 italic text-sm">No transcript available.</p>
    )
  }

  const fillerWords = Object.keys(fillers).filter(w => FILLERS.includes(w))

  if (fillerWords.length === 0) {
    return <p className="text-slate-300 leading-relaxed text-sm">{transcript}</p>
  }

  // Split transcript preserving spaces, highlight fillers
  const regex = new RegExp(`\\b(${fillerWords.map(w => w.replace(/\s/g, '\\s+')).join('|')})\\b`, 'gi')
  const parts = transcript.split(regex)

  return (
    <p className="text-slate-300 leading-relaxed text-sm">
      {parts.map((part, i) => {
        const isMatch = fillerWords.some(w => w.toLowerCase() === part.toLowerCase())
        return isMatch ? (
          <mark
            key={i}
            className="bg-red-500/25 text-red-300 px-0.5 rounded font-medium"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      })}
    </p>
  )
}
