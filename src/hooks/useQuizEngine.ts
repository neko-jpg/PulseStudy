"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ModuleDoc } from '@/lib/types'
import { useLearnStore } from '@/store/learn'
import { submitQuizAttempt } from '@/lib/apiClient'
import { enqueue } from '@/lib/quizQueue'
import { trackStepView, trackSubmit } from '@/lib/analytics'

export function useQuizEngine(doc: ModuleDoc | null, opts?: { onComplete?: (moduleId: string) => void; onFeedback?: (p: { question: string; answer: string }) => void }) {
  const [startTime, setStartTime] = useState<number | null>(null)
  const {
    moduleId,
    step,
    idx,
    selected,
    submitting,
    init,
    nextStep,
    select,
    setSubmitting,
    setStep,
    markResult,
    setElapsedTime,
  } = useLearnStore()

  useEffect(() => {
    if (doc) init(doc.id, 'quiz')
  }, [doc, init])

  useEffect(() => {
    if (step === 'quiz' && idx === 0 && !startTime) setStartTime(Date.now())
  }, [step, idx, startTime])

  const totalItems = doc?.items.length ?? 0
  const currentItem = useMemo(() => (doc ? doc.items[idx] : null), [doc, idx])
  const progressPercentage = useMemo(() => (totalItems > 0 ? ((idx + 1) / totalItems) * 100 : 0), [idx, totalItems])

  const handleNext = useCallback(() => {
    if (!doc) return
    if (step === 'result' && idx + 1 >= doc.items.length) {
      if (startTime) setElapsedTime(Date.now() - startTime)
      opts?.onComplete?.(moduleId)
      return
    }
    nextStep(doc.items.length)
    trackStepView(moduleId, idx + 1, 'quiz')
  }, [doc, step, idx, startTime, setElapsedTime, nextStep, moduleId, opts])

  const handleSubmit = useCallback(async () => {
    if (!doc || step !== 'quiz' || selected == null || submitting) return
    const item = doc.items[idx]
    const isCorrect = selected === item.answer
    setSubmitting(true)
    try {
      await submitQuizAttempt({ moduleId, idx, selected, correct: isCorrect })
    } catch {
      enqueue({ moduleId, idx, selected, correct: isCorrect, ts: Date.now() })
    }
    markResult(isCorrect, { question: item.q, selectedAnswer: item.choices[selected], correctAnswer: item.choices[item.answer] })
    trackSubmit(moduleId, idx, isCorrect)
    if (!isCorrect) {
      opts?.onFeedback?.({ question: item.q, answer: item.choices[selected] })
    }
    setSubmitting(false)
    setStep('result')
  }, [doc, step, selected, submitting, moduleId, idx, setSubmitting, markResult, setStep, opts])

  return {
    step,
    idx,
    selected,
    currentItem,
    totalItems,
    progressPercentage,
    select,
    handleSubmit,
    handleNext,
  }
}

