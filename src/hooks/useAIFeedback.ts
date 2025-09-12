"use client"

import { useState, useCallback } from 'react'
import { requestAIFeedback } from '@/lib/apiClient'

export function useAIFeedback() {
  const [aiFeedback, setAiFeedback] = useState<string | null>(null)
  const [isAiFeedbackLoading, setLoading] = useState(false)

  const fetchFeedback = useCallback(async (p: { question: string; answer: string; subject?: string }) => {
    setLoading(true)
    setAiFeedback(null)
    try {
      const out = await requestAIFeedback({ question: p.question, userAnswer: p.answer, subject: p.subject || '一般', difficulty: 'medium', hintsUsed: 0 })
      setAiFeedback(out.feedback)
    } catch {
      setAiFeedback('AIフィードバックの生成に失敗しました。次の一手：まず解説を読み、例題で確認しましょう。')
    } finally {
      setLoading(false)
    }
  }, [])

  return { aiFeedback, isAiFeedbackLoading, fetchFeedback }
}

