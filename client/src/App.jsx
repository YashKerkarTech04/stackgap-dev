import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { getRoles, getSkills, analyze } from './api/client'
import Navbar from './components/Navbar'
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

  const {
    data: rolesData,
    isLoading: rolesLoading,
    isError: rolesError,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  })

  const {
    data: skillsData,
    isLoading: skillsLoading,
    isError: skillsError,
    refetch: refetchSkills,
  } = useQuery({
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

  // If the user changes the role after already seeing results, the old
  // results no longer match what the dropdown shows. Clear them so the
  // page never displays results for a different role than is selected.
  function handleRoleChange(roleId) {
    setSelectedRole(roleId)
    setResult(null)
    setSelectedGapSkillId(null)
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

  if (rolesError || skillsError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <p className="text-slate-200 font-medium mb-2">
            Can't reach the StackGap server.
          </p>
          <p className="text-sm text-slate-500 mb-4">
            Make sure the API is running, then try again.
          </p>
          <button
            onClick={() => {
              refetchRoles()
              refetchSkills()
            }}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
  <div className="min-h-screen bg-slate-950">
    <Navbar />

    <main className="p-6">
      <div className="max-w-4xl mx-auto space-y-5">
        <InputSection
          roles={rolesData.roles}
          allSkills={skillsData.skills}
          selectedRole={selectedRole}
          onRoleChange={handleRoleChange}
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
              Based on {(result.sample_size ?? 0).toLocaleString()} job postings · StackGap
            </p>
          </>
        )}
      </div>
    </main>
  </div>
)
}

export default App