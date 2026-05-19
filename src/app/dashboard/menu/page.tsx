'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MenuItem, QuizQuestion } from '@/lib/types'
import QuizEngine from '@/components/QuizEngine'
import Link from 'next/link'

const CATEGORY_LABELS: Record<string, string> = {
  antipasti: 'Antipasti',
  pasta: 'Pasta',
  secondi: 'Secondi',
  dolci: 'Dolci',
}

const CATEGORY_ORDER = ['antipasti', 'pasta', 'secondi', 'dolci']

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizScore, setQuizScore] = useState<number | null>(null)
  const [progress, setProgress] = useState<{ score: number | null; completed_at: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const [{ data: menuData }, { data: quizData }, { data: prog }] = await Promise.all([
        supabase.from('menu_items').select('*').eq('available', true).order('sort_order'),
        supabase.from('menu_quiz_questions').select('*').eq('active', true).order('created_at'),
        supabase.from('staff_progress').select('score,completed_at').eq('module_slug', 'menu').eq('user_id', user!.id).single(),
      ])

      setItems(menuData || [])
      setQuestions(quizData || [])
      setProgress(prog)
      setLoading(false)
    }
    load()
  }, [])

  const grouped = CATEGORY_ORDER.reduce<Record<string, MenuItem[]>>((acc, cat) => {
    acc[cat] = items.filter(i => i.category === cat)
    return acc
  }, {})

  if (loading) return <div className="text-center py-12 text-gray-400">Loading…</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
        <h2 className="text-xl font-bold text-gray-900">Menu Training</h2>
      </div>

      {progress && (
        <div className="card mb-4 bg-green-50 border-green-100">
          <p className="text-sm text-green-700">
            ✅ Completed — Quiz score: <strong>{progress.score}%</strong> on{' '}
            {new Date(progress.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
          </p>
        </div>
      )}

      {!showQuiz ? (
        <>
          <p className="text-gray-500 text-sm mb-5">
            Study the menu below, then take the quiz at the bottom. Tap any dish for full details.
          </p>

          {CATEGORY_ORDER.map(cat => {
            const catItems = grouped[cat]
            if (!catItems?.length) return null
            return (
              <div key={cat} className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gold-600 mb-3">
                  {CATEGORY_LABELS[cat]}
                </h3>
                <div className="space-y-2">
                  {catItems.map(item => (
                    <div
                      key={item.id}
                      className="card cursor-pointer"
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                          {item.subtitle && (
                            <div className="text-xs text-gray-400 italic mt-0.5">{item.subtitle}</div>
                          )}
                        </div>
                        <span className="text-gray-300 text-sm">{expanded === item.id ? '▲' : '▼'}</span>
                      </div>

                      {expanded === item.id && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                          <p className="text-sm text-gray-700">{item.description}</p>
                          {item.allergens?.length > 0 && (
                            <div>
                              <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Allergens: </span>
                              <span className="text-xs text-red-600">{item.allergens.join(', ')}</span>
                            </div>
                          )}
                          {item.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.tags.map(t => (
                                <span key={t} className="badge bg-forest-50 text-forest-700">{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {questions.length > 0 && (
            <div className="card border-gold-200 bg-gold-50 mt-6">
              <h3 className="font-semibold text-gray-900 mb-1">Ready for the quiz?</h3>
              <p className="text-sm text-gray-500 mb-3">
                {questions.length} questions · 70% to pass
              </p>
              <button onClick={() => setShowQuiz(true)} className="btn-gold">
                Start quiz
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Menu Quiz</h3>
          {quizScore !== null ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">{quizScore >= 70 ? '🎉' : '📚'}</div>
              <p className="font-semibold">{quizScore >= 70 ? 'Passed!' : 'Not quite — keep practising'}</p>
              <p className="text-gray-500 text-sm mb-4">Score: {quizScore}%</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setShowQuiz(false); setQuizScore(null) }} className="btn-secondary text-sm">
                  Review menu
                </button>
                <Link href="/dashboard" className="btn-primary text-sm">
                  Back to dashboard
                </Link>
              </div>
            </div>
          ) : (
            <QuizEngine
              questions={questions}
              moduleSlug="menu"
              onComplete={(score) => setQuizScore(score)}
            />
          )}
        </div>
      )}
    </div>
  )
}
