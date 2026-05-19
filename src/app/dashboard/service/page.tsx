'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ServiceStep } from '@/lib/types'
import Link from 'next/link'

export default function ServicePage() {
  const [steps, setSteps] = useState<ServiceStep[]>([])
  const [progress, setProgress] = useState<{ completed_at: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const [{ data: stepsData }, { data: prog }] = await Promise.all([
        supabase.from('service_steps').select('*').eq('active', true).order('step_number'),
        supabase.from('staff_progress').select('completed_at').eq('module_slug', 'service').eq('user_id', user!.id).single(),
      ])

      setSteps(stepsData || [])
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
      module_slug: 'service',
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
        <h2 className="text-xl font-bold text-gray-900">Order of Service</h2>
      </div>

      {progress && (
        <div className="card mb-4 bg-green-50 border-green-100">
          <p className="text-sm text-green-700">
            ✅ Acknowledged on{' '}
            {new Date(progress.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}

      <p className="text-gray-500 text-sm mb-6">
        Read through each step of our service standard. When you've finished, acknowledge at the bottom.
      </p>

      <div className="space-y-4">
        {steps.map(step => (
          <div key={step.id} className="card">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-forest-900 text-white flex items-center justify-center text-sm font-bold">
                {step.step_number}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{step.intro}</p>
                {step.bullets && step.bullets.length > 0 && (
                  <ul className="space-y-1">
                    {step.bullets.map((b, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-gold-500 mt-0.5">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {step.tip && (
                  <div className="mt-2 bg-gold-50 border border-gold-200 rounded-lg px-3 py-2 text-xs text-gold-700">
                    <strong>Tip:</strong> {step.tip}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-6 border-forest-100 bg-forest-50">
        {done ? (
          <div className="text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-semibold text-gray-900">You've acknowledged the order of service</p>
            <Link href="/dashboard" className="mt-3 inline-block btn-primary text-sm">
              Back to dashboard
            </Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700 mb-3 font-medium">
              I have read and understood the Banchory Lodge order of service.
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
