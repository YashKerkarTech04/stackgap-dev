export default function CompaniesPanel({ skillName, companies }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-full">
      <p className="text-xs text-slate-500 mb-4 uppercase tracking-wide">
        Companies hiring for it
      </p>

      {!skillName ? (
        <p className="text-sm text-slate-500">
          Click a skill on the left to see who's hiring for it.
        </p>
      ) : companies.length === 0 ? (
        <p className="text-sm text-slate-500">
          No company data available for {skillName} yet.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {companies.map((c) => (
            <li
              key={c.name}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-slate-200">{c.name}</span>
              <span className="text-slate-500">{c.jobs} jobs</span>
            </li>
          ))}
        </ul>
      )}

      {skillName && companies.length > 0 && (
        <p className="text-xs text-slate-600 mt-4">For {skillName}</p>
      )}
    </div>
  )
}