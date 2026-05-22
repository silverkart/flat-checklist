'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HandbookSection } from '@/lib/types'
import Link from 'next/link'

function renderContent(content: string) {
  // Basic markdown-ish rendering: bold, bullets
  return content.split('\n').map((line, i) => {
    if (line.startsWith('•')) {
      return (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="text-gold-500 mt-0.5 flex-shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: line.slice(1).trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </li>
      )
    }
    if (!line.trim()) return <div key={i} className="h-2" />
    return (
      <p key={i} className="text-sm text-gray-700"
        dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
      />
    )
  })
}

export default function HandbookPage() {
  const [sections, setSections] = useState<HandbookSection[]>([])
  const [progress, setProgress] = useState<{ completed_at: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [done, setDone] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const [{ data: handbookData }, { data: prog }] = await Promise.all([
        supabase.from('handbook_sections').select('*').eq('active', true).order('sort_order'),
        supabase.from('staff_progress').select('completed_at').eq('module_slug', 'handbook').eq('user_id', user!.id).single(),
      ])

      setSections(handbookData || [])
      if (handbookData?.length) setExpanded(handbookData[0].id)
      setProgress(prog)
      setDone(!!prog)
      setLoading(false)
    }
    load()
  }, [])

  async function markComplete() {
    setMarking(true)
    const supabase = createClient()
    await supabase.from('staff_progress').upsert({
      module_slug: 'handbook',
      score: null,
      completed_at: new Date().toISOString(),
      attempt_count: 1,
    }, { onConflict: 'user_id,module_slug' })
    setDone(true)
    setMarking(false)
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading…</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
        <h2 className="text-xl font-bold text-gray-900">Staff Handbook</h2>
      </div>

      {progress && (
        <div className="card mb-4 bg-green-50 border-green-100">
          <p className="text-sm text-green-700">
            ✅ Acknowledged on{' '}
            {new Date(progress.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}

      <p className="text-gray-500 text-sm mb-5">
        Read each section of the staff handbook. Tap a section to expand it.
      </p>

      <div className="space-y-3">
        {sections.map((section, idx) => (
          <div key={section.id} className="card overflow-hidden">
            <button
              className="w-full flex items-center justify-between text-left"
              onClick={() => setExpanded(expanded === section.id ? null : section.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gold-500 w-5">{idx + 1}</span>
                <span className="font-semibold text-gray-900 text-sm">{section.title}</span>
              </div>
              <span className="text-gray-300 ml-3">{expanded === section.id ? '▲' : '▼'}</span>
            </button>

            {expanded === section.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1.5">
                {renderContent(section.content)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card mt-6 border-forest-100 bg-forest-50">
        {done ? (
          <div className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-semibold text-gray-900">You've acknowledged the staff handbook</p>
            <Link href="/dashboard" className="mt-3 inline-block btn-primary text-sm">
              Back to dashboard
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700 mb-3 font-medium">
              I have read and understood the Banchory Lodge Staff Handbook.
            </p>
            <button onClick={markComplete} disabled={marking} className="btn-primary">
              {marking ? 'Saving…' : 'Acknowledge & complete'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
