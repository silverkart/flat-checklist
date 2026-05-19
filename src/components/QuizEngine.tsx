'use client'

import { useState } from 'react'
import { QuizQuestion } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface Props {
  questions: QuizQuestion[]
  moduleSlug: string
  onComplete: (score: number) => void
}

export default function QuizEngine({ questions, moduleSlug, onComplete }: Props) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [revealed, setRevealed] = useState(false)
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)

  const q = questions[current]
  const totalQuestions = questions.length

  function handleSelect(idx: number) {
    if (revealed) return
    setSelected(idx)
  }

  function handleConfirm() {
    if (selected === null) return
    setRevealed(true)
  }

  async function handleNext() {
    const correct = selected === q.correct_index
    const newAnswers = [...answers, correct]

    if (current + 1 >= totalQuestions) {
      const score = Math.round((newAnswers.filter(Boolean).length / totalQuestions) * 100)
      setAnswers(newAnswers)
      setFinished(true)
      setSaving(true)

      const supabase = createClient()
      await supabase.from('staff_progress').upsert({
        module_slug: moduleSlug,
        score,
        completed_at: new Date().toISOString(),
        attempt_count: 1,
      }, { onConflict: 'user_id,module_slug' })

      setSaving(false)
      onComplete(score)
    } else {
      setAnswers(newAnswers)
      setCurrent(c => c + 1)
      setSelected(null)
      setRevealed(false)
    }
  }

  if (finished) {
    const score = Math.round((answers.filter(Boolean).length / totalQuestions) * 100)
    const passed = score >= 70
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-3">{passed ? '🎉' : '📚'}</div>
        <h3 className="text-xl font-bold mb-1">{passed ? 'Well done!' : 'Keep practising!'}</h3>
        <p className="text-gray-500 text-sm mb-2">
          You scored <strong>{score}%</strong> ({answers.filter(Boolean).length}/{totalQuestions} correct)
        </p>
        {!passed && (
          <p className="text-sm text-amber-600 mb-4">You need 70% to pass. Have another read and try again.</p>
        )}
        {saving && <p className="text-xs text-gray-400">Saving results…</p>}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">Question {current + 1} of {totalQuestions}</span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full w-6 transition-colors ${
                i < current ? 'bg-forest-500' : i === current ? 'bg-gold-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <p className="font-semibold text-gray-900 mb-4 leading-snug">{q.question}</p>

      <div className="space-y-2 mb-4">
        {q.options.map((opt, idx) => {
          let cls = 'w-full text-left px-4 py-3 rounded-xl border text-sm transition-all '
          if (!revealed) {
            cls += selected === idx
              ? 'border-forest-500 bg-forest-50 text-forest-900'
              : 'border-gray-200 bg-white hover:border-forest-300'
          } else {
            if (idx === q.correct_index) cls += 'border-green-500 bg-green-50 text-green-800'
            else if (idx === selected && idx !== q.correct_index) cls += 'border-red-400 bg-red-50 text-red-800'
            else cls += 'border-gray-100 bg-gray-50 text-gray-400'
          }
          return (
            <button key={idx} className={cls} onClick={() => handleSelect(idx)}>
              <span className="mr-2 font-medium">{String.fromCharCode(65 + idx)}.</span>
              {opt}
            </button>
          )
        })}
      </div>

      {revealed && q.explanation && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-sm text-blue-800">
          <strong>Explanation:</strong> {q.explanation}
        </div>
      )}

      {!revealed ? (
        <button
          disabled={selected === null}
          onClick={handleConfirm}
          className="btn-primary w-full"
        >
          Confirm answer
        </button>
      ) : (
        <button onClick={handleNext} className="btn-primary w-full">
          {current + 1 >= totalQuestions ? 'See results' : 'Next question'}
        </button>
      )}
    </div>
  )
}
