'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MenuItem, QuizQuestion } from '@/lib/types'
import QuizEngine from '@/components/QuizEngine'
import Link from 'next/link'

const CATEGORY_LABELS: Record<string, { label: string; italian?: string }> = {
  antipasti: { label: 'Antipasti', italian: 'Starters' },
  mains:     { label: 'Mains', italian: 'Secondi' },
  classics:  { label: 'Lodge Classics' },
  grills:    { label: 'From the Grill', italian: 'Alla Brace' },
  dessert:   { label: 'Desserts', italian: 'Dolci' },
  sides:     { label: 'Sides' },
}
const CATEGORY_ORDER = ['antipasti', 'mains', 'classics', 'grills', 'dessert', 'sides']

function AllergenBadge({ text }: { text: string }) {
  const lower = text.toLowerCase()
  let cls = 'badge text-xs '
  if (lower.includes('may contain') || lower.includes('confirm') || lower.includes('optional')) {
    cls += 'bg-blue-50 text-blue-700'
  } else {
    cls += 'bg-red-50 text-red-700'
  }
  return <span className={cls}>{text}</span>
}

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
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
        <h2 className="text-xl font-bold text-gray-900">Menu Training</h2>
      </div>
      <p className="text-gray-500 text-sm mb-5 ml-10">
        Study each dish — tap to reveal training notes and the suggested sell line. Quiz at the bottom.
      </p>

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
          {CATEGORY_ORDER.map(cat => {
            const catItems = grouped[cat]
            if (!catItems?.length) return null
            const meta = CATEGORY_LABELS[cat]
            return (
              <div key={cat} className="mb-8">
                <div className="flex items-baseline gap-3 mb-3">
                  <h3 className="font-bold text-gray-900">{meta.label}</h3>
                  {meta.italian && (
                    <span className="text-xs italic text-gold-600">{meta.italian}</span>
                  )}
                </div>

                <div className="space-y-2">
                  {catItems.map(item => (
                    <div key={item.id} className="card overflow-hidden">
                      {/* Header row — always visible */}
                      <div
                        className="flex items-start justify-between gap-3 cursor-pointer"
                        onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 text-sm leading-snug">
                              {item.name}
                            </span>
                            {item.tags?.includes('Weekend only') && (
                              <span className="badge bg-gold-50 text-gold-600 text-xs">Fri & Sat only</span>
                            )}
                            {item.tags?.includes('Vegetarian') && (
                              <span className="badge bg-green-50 text-green-700 text-xs">V</span>
                            )}
                            {item.tags?.includes('Vegan') && (
                              <span className="badge bg-green-50 text-green-700 text-xs">VE</span>
                            )}
                          </div>
                          {item.subtitle && (
                            <p className="text-xs text-gray-400 mt-0.5 leading-snug">{item.subtitle}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {item.price && (
                            <span className="text-sm font-semibold text-forest-700">{item.price}</span>
                          )}
                          <span className="text-gray-300 text-sm">{expanded === item.id ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* Expandable training content */}
                      {expanded === item.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                          {/* Training description */}
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-widest text-forest-600 mb-1">
                              Training Notes
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{item.description}</p>
                          </div>

                          {/* Sell line */}
                          {item.sell_line && (
                            <div className="bg-forest-50 border-l-4 border-forest-500 rounded-r-xl px-4 py-3">
                              <div className="text-xs font-semibold uppercase tracking-widest text-forest-600 mb-1">
                                How to sell it
                              </div>
                              <p className="text-sm italic text-forest-800 leading-relaxed">
                                {item.sell_line}
                              </p>
                            </div>
                          )}

                          {/* Allergens */}
                          {item.allergens?.length > 0 && (
                            <div>
                              <div className="text-xs font-semibold uppercase tracking-widest text-red-600 mb-1.5">
                                Allergens
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {item.allergens.map((a, i) => (
                                  <AllergenBadge key={i} text={a} />
                                ))}
                              </div>
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
            <div className="card border-gold-200 bg-amber-50 mt-4">
              <h3 className="font-semibold text-gray-900 mb-1">Ready for the quiz?</h3>
              <p className="text-sm text-gray-500 mb-3">{questions.length} questions · 70% to pass</p>
              <button onClick={() => setShowQuiz(true)} className="btn-gold">Start quiz</button>
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
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={() => { setShowQuiz(false); setQuizScore(null) }} className="btn-secondary text-sm">
                  Review menu
                </button>
                <Link href="/dashboard" className="btn-primary text-sm">Back to dashboard</Link>
              </div>
            </div>
          ) : (
            <QuizEngine questions={questions} moduleSlug="menu" onComplete={setQuizScore} />
          )}
        </div>
      )}
    </div>
  )
}
