'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wine, QuizQuestion } from '@/lib/types'
import QuizEngine from '@/components/QuizEngine'
import Link from 'next/link'

const CAT_LABELS: Record<string, string> = {
  sparkling: 'Sparkling',
  white: 'White',
  rose: 'Rosé',
  red: 'Red',
  dessert: 'Dessert',
}
const CAT_ORDER = ['sparkling', 'white', 'rose', 'red', 'dessert']
const CAT_EMOJI: Record<string, string> = {
  sparkling: '🥂', white: '🍾', rose: '🌹', red: '🍷', dessert: '🍯',
}

export default function WinePage() {
  const [wines, setWines] = useState<Wine[]>([])
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

      const [{ data: wineData }, { data: quizData }, { data: prog }] = await Promise.all([
        supabase.from('wines').select('*').eq('available', true).order('sort_order'),
        supabase.from('wine_quiz_questions').select('*').eq('active', true).order('created_at'),
        supabase.from('staff_progress').select('score,completed_at').eq('module_slug', 'wine').eq('user_id', user!.id).single(),
      ])

      setWines(wineData || [])
      setQuestions(quizData || [])
      setProgress(prog)
      setLoading(false)
    }
    load()
  }, [])

  const grouped = CAT_ORDER.reduce<Record<string, Wine[]>>((acc, cat) => {
    acc[cat] = wines.filter(w => w.category === cat)
    return acc
  }, {})

  if (loading) return <div className="text-center py-12 text-gray-400">Loading…</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 text-sm">← Back</Link>
        <h2 className="text-xl font-bold text-gray-900">Wine Training</h2>
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
            Learn our wine list — tasting notes, serving temperatures and food pairings — then take the quiz.
          </p>

          {CAT_ORDER.map(cat => {
            const catWines = grouped[cat]
            if (!catWines?.length) return null
            return (
              <div key={cat} className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gold-600 mb-3 flex items-center gap-2">
                  <span>{CAT_EMOJI[cat]}</span>{CAT_LABELS[cat]}
                </h3>
                <div className="space-y-2">
                  {catWines.map(wine => (
                    <div
                      key={wine.id}
                      className="card cursor-pointer"
                      onClick={() => setExpanded(expanded === wine.id ? null : wine.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{wine.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{wine.region}</div>
                        </div>
                        <span className="text-gray-300 text-sm">{expanded === wine.id ? '▲' : '▼'}</span>
                      </div>

                      {expanded === wine.id && (
                        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm text-gray-700">
                          <div><span className="font-medium text-gray-500">Tasting notes:</span> {wine.tasting_notes}</div>
                          <div><span className="font-medium text-gray-500">Serving temp:</span> {wine.serving_temp}</div>
                          <div><span className="font-medium text-gray-500">Food pairing:</span> {wine.food_pairing}</div>
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
              <p className="text-sm text-gray-500 mb-3">{questions.length} questions · 70% to pass</p>
              <button onClick={() => setShowQuiz(true)} className="btn-gold">Start quiz</button>
            </div>
          )}
        </>
      ) : (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Wine Quiz</h3>
          {quizScore !== null ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">{quizScore >= 70 ? '🎉' : '📚'}</div>
              <p className="font-semibold">{quizScore >= 70 ? 'Passed!' : 'Not quite — keep practising'}</p>
              <p className="text-gray-500 text-sm mb-4">Score: {quizScore}%</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => { setShowQuiz(false); setQuizScore(null) }} className="btn-secondary text-sm">
                  Review wines
                </button>
                <Link href="/dashboard" className="btn-primary text-sm">Back to dashboard</Link>
              </div>
            </div>
          ) : (
            <QuizEngine questions={questions} moduleSlug="wine" onComplete={setQuizScore} />
          )}
        </div>
      )}
    </div>
  )
}
