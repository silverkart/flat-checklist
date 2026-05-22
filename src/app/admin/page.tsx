import { createClient } from '@/lib/supabase/server'
import { MODULES } from '@/lib/types'

export default async function AdminOverviewPage() {
  const supabase = createClient()

  const [{ data: profiles }, { data: progress }] = await Promise.all([
    supabase.from('app_profiles').select('id, full_name, role, is_approved, created_at'),
    supabase.from('staff_progress').select('user_id, module_slug, score, completed_at'),
  ])

  const pending = profiles?.filter(p => !p.is_approved) || []
  const approved = profiles?.filter(p => p.is_approved) || []

  // Build completion matrix
  const completionByModule = MODULES.map(m => {
    const done = progress?.filter(p => p.module_slug === m.slug).length || 0
    return { ...m, done, total: approved.length }
  })

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Admin Overview</h2>

      {pending.length > 0 && (
        <div className="card border-amber-200 bg-amber-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-amber-900">
              {pending.length} staff awaiting approval
            </h3>
            <a href="/admin/staff" className="text-sm text-amber-700 underline">Manage →</a>
          </div>
          <div className="space-y-2">
            {pending.slice(0, 3).map(p => (
              <div key={p.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2">
                <span className="text-sm font-medium">{p.full_name || 'New staff'}</span>
                <span className="text-xs text-gray-400">
                  {new Date(p.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Training completion</h3>
        <div className="space-y-3">
          {completionByModule.map(m => (
            <div key={m.slug} className="card">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{m.icon}</span>
                  <span className="font-medium text-sm">{m.label}</span>
                </div>
                <span className="text-sm text-gray-500">{m.done}/{m.total}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-forest-600 rounded-full"
                  style={{ width: m.total ? `${(m.done / m.total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-forest-700">{approved.length}</div>
          <div className="text-xs text-gray-500 mt-1">Active staff</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-amber-600">{pending.length}</div>
          <div className="text-xs text-gray-500 mt-1">Pending approval</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-forest-700">
            {progress?.length || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">Modules completed</div>
        </div>
      </div>
    </div>
  )
}
