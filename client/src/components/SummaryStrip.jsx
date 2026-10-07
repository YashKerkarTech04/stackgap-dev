/**
 * Props:
 *   matchScore: number
 *   sampleSize: number
 *   skillsMissingCount: number
 */
export default function SummaryStrip({ matchScore, sampleSize, skillsMissingCount }) {
  const items = [
    { label: 'Match score', value: `${matchScore}%` },
    { label: 'Jobs analyzed', value: sampleSize.toLocaleString() },
    { label: 'Skills missing', value: skillsMissingCount },
  ]
 
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4"
        >
          <p className="text-xs text-slate-500 mb-1">{item.label}</p>
          <p className="text-2xl font-semibold text-slate-100">{item.value}</p>
        </div>
      ))}
    </div>
  )
}