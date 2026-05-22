'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import { MODULES } from '@/lib/types'

type StaffRow = Profile & { email?: string }

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffRow[]>([])
  const [progress, setProgress] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'all'>('pending')

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()
    const [{ data: profiles }, { data: prog }] = await Promise.all([
      supabase.from('app_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('staff_progress').select('user_id, module_slug'),
    ])

    setStaff(profiles || [])

    const map: Record<string, string[]> = {}
    prog?.forEach(p => {
      if (!map[p.user_id]) map[p.user_id] = []
      map[p.user_id].push(p.module_slug)
    })
    setProgress(map)
    setLoading(false)
  }

  async function updateProfile(id: string, updates: Partial<Profile>) {
    setActionLoading(id)
    const supabase = createClient()
    await supabase.from('app_profiles').update(updates).eq('id', id)
    await load()
    setActionLoading(null)
  }

  const pending = staff.filter(s => !s.is_approved)
  const all = staff.filter(s => s.is_approved)
  const displayed = tab === 'pending' ? pending : all

  if (loading) return <div className="text-center py-12 text-gray-400">Loading…</div>

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Staff Management</h2>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'pending' ? 'bg-forest-900 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Pending {pending.length > 0 && `(${pending.length})`}
        </button>
        <button
          onClick={() => setTab('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            tab === 'all' ? 'bg-forest-900 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Active ({all.length})
        </button>
      </div>

      {displayed.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          {tab === 'pending' ? 'No staff awaiting approval.' : 'No active staff yet.'}
        </div>
      )}

      <div className="space-y-3">
        {displayed.map(person => {
          const modules = progress[person.id] || []
          return (
            <div key={person.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{person.full_name || 'Unknown'}</div>
                  <div className="text-xs text-gray-400 mt-0.5 capitalize">{person.role}</div>

                  {tab === 'all' && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {MODULES.map(m => (
                        <span
                          key={m.slug}
                          className={`badge text-xs ${
                            modules.includes(m.slug)
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {m.icon} {m.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 items-end">
                  {tab === 'pending' && (
                    <>
                      <button
                        disabled={actionLoading === person.id}
                        onClick={() => updateProfile(person.id, { is_approved: true })}
                        className="btn-primary text-xs py-1.5 px-3"
                      >
                        Approve
                      </button>
                      <button
                        disabled={actionLoading === person.id}
                        onClick={() => updateProfile(person.id, { is_approved: false, role: 'staff' })}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {tab === 'all' && (
                    <div className="flex gap-2">
                      <select
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                        value={person.role}
                        onChange={e => updateProfile(person.id, { role: e.target.value as Profile['role'] })}
                        disabled={actionLoading === person.id}
                      >
                        <option value="staff">Staff</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        disabled={actionLoading === person.id}
                        onClick={() => updateProfile(person.id, { is_approved: false })}
                        className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2 py-1 rounded-lg"
                      >
                        Suspend
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
