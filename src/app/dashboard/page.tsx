import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MODULES } from '@/lib/types'
import { StaffProgress } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: progressRows } = await supabase
    .from('staff_progress')
    .select('*')
    .eq('user_id', user.id)

  const progress: Record<string, StaffProgress> = {}
  progressRows?.forEach(r => { progress[r.module_slug] = r })

  const totalDone = MODULES.filter(m => progress[m.slug]).length

  return (
    <div>
      <div className="mb-7">
        <h2 className="font-serif text-2xl text-gray-900">Training Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          {totalDone} of {MODULES.length} modules completed
        </p>
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-600 rounded-full transition-all"
            style={{ width: `${(totalDone / MODULES.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODULES.map(module => {
          const p = progress[module.slug]
          const done = !!p
          const score = p?.score

          return (
            <Link
              key={module.slug}
              href={`/dashboard/${module.slug}`}
              className="card hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{module.icon}</div>
                {done ? (
                  <span className="badge bg-teal-50 text-teal-700">
                    {score !== null && score !== undefined ? `${score}%` : '✓'}
                  </span>
                ) : (
                  <span className="badge bg-amber-50 text-amber-600">Not started</span>
                )}
              </div>
              <h3 className="font-serif text-lg text-gray-900 group-hover:text-teal-700 transition-colors">
                {module.label}
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                {module.hasQuiz ? 'Content + quiz' : 'Read & acknowledge'}
              </p>
              {done && (
                <p className="text-xs text-gray-400 mt-2">
                  Completed {new Date(p.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
