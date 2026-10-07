import SkillChipInput from './SkillChipInput'

/**
 * Props:
 *   roles: [{ id, name, sample_size }]
 *   allSkills: [{ id, name, category }]
 *   selectedRole: string
 *   onRoleChange: (roleId: string) => void
 *   selectedSkills: string[]
 *   onSkillsChange: (ids: string[]) => void
 *   onAnalyze: () => void
 *   isAnalyzing: boolean
 */
export default function InputSection({
  roles,
  allSkills,
  selectedRole,
  onRoleChange,
  selectedSkills,
  onSkillsChange,
  onAnalyze,
  isAnalyzing,
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h1 className="text-2xl font-bold text-slate-100 mb-1">
        See what jobs ask for beyond your skills
      </h1>
      <p className="text-slate-400 text-sm mb-5">
        Pick a role and add what you already know.
      </p>

      <div className="mb-4">
        <label className="block text-xs text-slate-500 mb-1.5">Target role</label>
        <select
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 outline-none focus:border-blue-600"
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name} ({role.sample_size} jobs analyzed)
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className="block text-xs text-slate-500 mb-1.5">Skills you already know</label>
        <SkillChipInput
          allSkills={allSkills}
          selectedIds={selectedSkills}
          onChange={onSkillsChange}
        />
      </div>

      <button
        onClick={onAnalyze}
        disabled={!selectedRole || isAnalyzing}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        {isAnalyzing ? 'Analyzing...' : 'Analyze my skill gap'}
      </button>
    </div>
  )
}
