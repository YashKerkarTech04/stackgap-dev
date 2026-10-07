import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getRoles, getSkills, analyze } from './api/client'
import InputSection from './components/InputSection'
import SummaryStrip from './components/SummaryStrip'
import MissingSkillsList from './components/MissingSkillsList'
import CompaniesPanel from './components/CompaniesPanel'
import CoursesPanel from './components/CoursesPanel'

function App() {
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedSkills, setSelectedSkills] = useState([])
  const [result, setResult] = useState(null)
  const [selectedGapSkillId, setSelectedGapSkillId] = useState(null)

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  })

  const { data: skillsData, isLoading: skillsLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: getSkills,
  })

  const analyzeMutation = useMutation({
    mutationFn: analyze,
    onSuccess: (data) => {
      setResult(data)
      setSelectedGapSkillId(data.missing_skills[0]?.skill_id || null)
    },
  })

  // Default the role dropdown to the first role once roles load.
  if (rolesData && !selectedRole && rolesData.roles.length > 0) {
    setSelectedRole(rolesData.roles[0].id)
  }

  function handleAnalyze() {
    analyzeMutation.mutate({ role: selectedRole, skills: selectedSkills })
  }

  const selectedGapSkill = useMemo(() => {
    if (!result || !selectedGapSkillId) return null
    return result.missing_skills.find((s) => s.skill_id === selectedGapSkillId) || null
  }, [result, selectedGapSkillId])

  if (rolesLoading || skillsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <InputSection
          roles={rolesData.roles}
          allSkills={skillsData.skills}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          selectedSkills={selectedSkills}
          onSkillsChange={setSelectedSkills}
          onAnalyze={handleAnalyze}
          isAnalyzing={analyzeMutation.isPending}
        />

        {analyzeMutation.isError && (
          <div className="bg-red-950/40 border border-red-900 rounded-xl p-4 text-sm text-red-300">
            {analyzeMutation.error.message}
          </div>
        )}

        {result && (
          <>
            <SummaryStrip
              matchScore={result.match_score}
              sampleSize={result.sample_size}
              skillsMissingCount={result.skills_missing_count}
            />

            <div className="grid md:grid-cols-2 gap-5">
              <MissingSkillsList
                skills={result.missing_skills}
                selectedSkillId={selectedGapSkillId}
                onSelectSkill={setSelectedGapSkillId}
              />
              <CompaniesPanel
                skillName={selectedGapSkill?.name || null}
                companies={selectedGapSkill?.top_companies || []}
              />
            </div>

            <CoursesPanel
              skillId={selectedGapSkillId}
              skillName={selectedGapSkill?.name || null}
            />

            <p className="text-xs text-slate-600 text-center pt-2">
              Based on {result.sample_size.toLocaleString()} job postings · StackGap
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default App