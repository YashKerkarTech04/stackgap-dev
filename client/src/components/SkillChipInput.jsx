import { useState, useMemo, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

/**
 * A tag/chip input for selecting known skills, with autocomplete against
 * the full skills list fetched from the API.
 *
 * Props:
 *   allSkills: [{ id, name, category }]   — full list from GET /api/skills
 *   selectedIds: string[]                  — currently selected skill ids
 *   onChange: (newSelectedIds: string[]) => void
 */
export default function SkillChipInput({ allSkills, selectedIds, onChange }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return allSkills
      .filter((s) => !selectedSet.has(s.id))
      .filter((s) => s.name.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query, allSkills, selectedSet])

  // Close the dropdown when clicking outside the component.
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function addSkill(skillId) {
    if (!selectedSet.has(skillId)) {
      onChange([...selectedIds, skillId])
    }
    setQuery('')
    setIsOpen(false)
  }

  function removeSkill(skillId) {
    onChange(selectedIds.filter((id) => id !== skillId))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault()
      addSkill(suggestions[0].id)
    } else if (e.key === 'Backspace' && query === '' && selectedIds.length > 0) {
      removeSkill(selectedIds[selectedIds.length - 1])
    }
  }

  const selectedSkillObjects = selectedIds
    .map((id) => allSkills.find((s) => s.id === id))
    .filter(Boolean)

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap gap-2 p-3 bg-slate-800 border border-slate-700 rounded-lg min-h-[52px]">
        {selectedSkillObjects.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center gap-1 bg-blue-600/20 text-blue-300 text-sm px-3 py-1 rounded-full border border-blue-600/40"
          >
            {skill.name}
            <button
              type="button"
              onClick={() => removeSkill(skill.id)}
              className="hover:text-white"
              aria-label={`Remove ${skill.name}`}
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedIds.length === 0 ? 'Type a skill, e.g. React...' : 'Add another...'}
          className="flex-1 min-w-[140px] bg-transparent outline-none text-slate-100 placeholder:text-slate-500 text-sm py-1"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => addSkill(s.id)}
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700 flex items-center justify-between"
              >
                <span>{s.name}</span>
                <span className="text-xs text-slate-500">{s.category}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
