import { useQuery } from '@tanstack/react-query'
import { ExternalLink } from 'lucide-react'
import { getCourses } from '../api/client'

/**
 * Props:
 *   skillId: string | null
 *   skillName: string | null
 */
export default function CoursesPanel({ skillId, skillName }) {
  const { data, isLoading } = useQuery({
    queryKey: ['courses', skillId],
    queryFn: () => getCourses(skillId),
    enabled: !!skillId,
  })

  if (!skillId) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
          Recommended courses
        </p>
        <p className="text-sm text-slate-500">
          Click a skill above to see how to learn it.
        </p>
      </div>
    )
  }

  const courses = data?.courses || []

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <p className="text-xs text-slate-500 mb-4 uppercase tracking-wide">
        Learn {skillName}
      </p>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading courses...</p>
      ) : courses.length === 0 ? (
        <p className="text-sm text-slate-500">
          No courses added for {skillName} yet.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {courses.map((course) => (
            <a
              key={course.url}
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-slate-800 rounded-lg p-3 hover:border-slate-700 hover:bg-slate-800/50 transition-colors"
            >
              <p className="text-sm font-medium text-slate-100 mb-1">
                {course.title}
              </p>
              <p className="text-xs text-slate-500 mb-2">
                {course.platform}
                {course.duration_hours ? ` · ${course.duration_hours} hours` : ''}
              </p>
              <span className="inline-flex items-center gap-1 text-xs text-blue-400">
                View course <ExternalLink size={12} />
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}