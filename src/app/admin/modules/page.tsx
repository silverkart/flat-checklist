'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HandbookSection } from '@/lib/types'

export default function AdminModulesPage() {
  const [sections, setSections] = useState<HandbookSection[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const supabase = createClient()
    const { data } = await supabase.from('handbook_sections').select('*').order('sort_order')
    setSections(data || [])
    setLoading(false)
  }

  function startEdit(s: HandbookSection) {
    setEditing(s.id)
    setEditTitle(s.title)
    setEditContent(s.content)
  }

  async function saveEdit() {
    if (!editing) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('handbook_sections').update({
      title: editTitle,
      content: editContent,
      updated_at: new Date().toISOString(),
    }).eq('id', editing)
    setEditing(null)
    await load()
    setSaving(false)
  }

  async function addSection() {
    setSaving(true)
    const supabase = createClient()
    const maxOrder = sections.reduce((m, s) => Math.max(m, s.sort_order), 0)
    await supabase.from('handbook_sections').insert({
      title: 'New Section',
      content: 'Add your content here.',
      sort_order: maxOrder + 1,
    })
    await load()
    setSaving(false)
    setAdding(false)
  }

  async function deleteSection(id: string) {
    if (!confirm('Delete this section?')) return
    const supabase = createClient()
    await supabase.from('handbook_sections').delete().eq('id', id)
    await load()
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading…</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Module Content</h2>
        <button onClick={addSection} disabled={saving} className="btn-primary text-sm">
          + Add section
        </button>
      </div>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
        <strong>Handbook editor</strong> — Edit sections of the Staff Handbook below.
        Use <code className="bg-blue-100 px-1 rounded">**bold**</code> for bold text and start lines with{' '}
        <code className="bg-blue-100 px-1 rounded">•</code> for bullet points.
      </div>

      <div className="space-y-4">
        {sections.map(s => (
          <div key={s.id} className="card">
            {editing === s.id ? (
              <div className="space-y-3">
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold"
                  placeholder="Section title"
                />
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={8}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono"
                  placeholder="Content…"
                />
                <div className="flex gap-2">
                  <button onClick={saveEdit} disabled={saving} className="btn-primary text-sm">
                    {saving ? 'Saving…' : 'Save'}
                  </button>
                  <button onClick={() => setEditing(null)} className="btn-secondary text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{s.title}</h3>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{s.content}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(s)} className="text-xs text-forest-600 hover:text-forest-800 border border-forest-200 px-2 py-1 rounded-lg">
                    Edit
                  </button>
                  <button onClick={() => deleteSection(s.id)} className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2 py-1 rounded-lg">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
