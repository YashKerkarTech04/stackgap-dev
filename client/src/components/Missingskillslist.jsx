export default function MissingSkillsList({ skills, selectedSkillId, onSelectSkill }) {
  if (skills.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-sm">
        You already know every skill we track for this role. Nice.
      </div>
    )
  }
 
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <p className="text-xs text-slate-500 mb-4 uppercase tracking-wide">
        Missing skills, by demand
      </p>
 
      <div className="space-y-3">
        {skills.map((skill) => {
          const isSelected = skill.skill_id === selectedSkillId
          return (
            <button
              key={skill.skill_id}
              onClick={() => onSelectSkill(skill.skill_id)}
              className={`w-full flex items-center gap-3 text-left rounded-lg px-2 py-1.5 transition-colors ${
                isSelected ? 'bg-slate-800' : 'hover:bg-slate-800/50'
              }`}
            >
              <span className="w-28 shrink-0 text-sm text-slate-200">
                {skill.name}
              </span>
              <span className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <span
                  className="block h-full bg-blue-500 rounded-full"
                  style={{ width: `${skill.pct}%` }}
                />
              </span>
              <span className="w-12 shrink-0 text-right text-sm text-slate-400">
                {skill.pct}%
              </span>
              {skill.trend && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                    skill.trend === 'rising'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {skill.trend}
                </span>
              )}
            </button>
          )
        })}
      </div>
 
      <p className="text-xs text-slate-500 mt-4">
        Click a skill to see companies hiring for it and courses to learn it.
      </p>
    </div>
  )
}