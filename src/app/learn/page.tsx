"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, XCircle, HelpCircle, Lightbulb, Bot } from 'lucide-react'
import type { ModuleDoc } from '@/lib/types'
import { useLearnStore } from '@/store/learn'
import { track, trackStepView, trackSubmit } from '@/lib/analytics'
import { enqueue, flush, setupFlushListeners } from '@/lib/quizQueue'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export default function LearnPage() {
  const router = useRouter()
  const { toast } = useToast()
  const params = useSearchParams()
  const moduleParam = params.get('module') || 'quad-basic'
  const [doc, setDoc] = useState<ModuleDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  const {
    moduleId,
    step,
    idx,
    selected,
    submitting,
    correct,
    total,
    init,
    nextStep,
    select,
    setSubmitting,
    setStep,
    markResult,
    setElapsedTime,
  } = useLearnStore()

  useEffect(() => {
    let active = true
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    async function load() {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        router.push(`/offline?from=/learn?module=${encodeURIComponent(moduleParam)}`)
        return
      }
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/modules/${moduleParam}`, { cache: 'no-store', signal: controller.signal })
        if (!res.ok) {
          if (res.status === 401) return router.push('/login')
          throw new Error('failed')
        }
        const json: ModuleDoc = await res.json()
        if (!active) return
        setDoc(json)
        init(json.id, 'quiz') // Start directly with the quiz
      } catch (e: any) {
        setError(e?.name === 'AbortError' ? 'timeout' : 'network')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
      clearTimeout(timeout)
      controller.abort()
    }
  }, [moduleParam, router, init])

  useEffect(() => {
    flush()
    const cleanup = setupFlushListeners()
    return () => {
      if (typeof cleanup === 'function') cleanup()
    }
  }, [])

  // Set start time when quiz starts
  useEffect(() => {
    if (step === 'quiz' && idx === 0 && !startTime) {
      setStartTime(Date.now())
    }
  }, [step, idx, startTime])

  const totalItems = doc?.items.length ?? 0

  function onNext() {
    if (!doc) return
    if (step === 'result' && idx + 1 >= doc.items.length) {
      if (startTime) {
        const elapsedTime = Date.now() - startTime
        setElapsedTime(elapsedTime)
      }
      router.push(`/learn/${moduleId}/results`)
      return
    }
    setShowHint(false)
    nextStep(doc.items.length)
    trackStepView(moduleId, idx + 1, 'quiz')
  }

  async function onSubmit() {
    if (!doc || step !== 'quiz' || selected == null || submitting) return
    setSubmitting(true)
    const item = doc.items[idx]
    const isCorrect = selected === item.answer
    try {
      await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, idx, selected, correct: isCorrect }),
      })
    } catch {
      toast({ description: '送信に失敗しました。後で再送します。' })
      enqueue({ moduleId, idx, selected, correct: isCorrect, ts: Date.now() })
    }
    markResult(isCorrect ? 1 : 0)
    trackSubmit(moduleId, idx, isCorrect)
    setSubmitting(false)
    setStep('result')
  }

  if (loading) {
    return (
      <main className="flex-1 p-8 bg-background">
        <Skeleton className="h-8 w-72 mb-2" />
        <Skeleton className="h-6 w-48 mb-8" />
        <div className="bg-card border rounded-lg p-8">
          <Skeleton className="h-6 w-32 mb-6" />
          <Skeleton className="h-80 w-full mb-8" />
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="flex justify-end items-center space-x-4">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="mb-3">読み込みに失敗しました。</div>
        <Button onClick={() => location.reload()}>再試行</Button>
      </div>
    )
  }

  if (!doc) return null

  const item = doc.items[idx]
  const progressPercentage = totalItems > 0 ? ((idx + 1) / totalItems) * 100 : 0

  const getButtonVariant = (i: number) => {
    if (step === 'result') {
      if (i === item.answer) return 'success'
      if (i === selected) return 'destructive'
      return 'secondary'
    }
    return selected === i ? 'default' : 'secondary'
  }

  return (
    <main className="flex-1 p-8 bg-background text-foreground">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">{doc.title}</h2>
          <div className="flex items-center mt-2">
            <p className="text-muted-foreground mr-4">
              {doc.subject} {idx + 1}/{totalItems}
            </p>
            <div className="w-64 h-2 bg-secondary rounded-full">
              <div className="h-full bg-primary rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" className="bg-yellow-400 text-black hover:bg-yellow-500">
            <Lightbulb />
          </Button>
          <Button variant="outline" size="icon">
            <Bot />
          </Button>
          <Button variant="outline" size="icon">
            <HelpCircle />
          </Button>
        </div>
      </header>

      <div className="bg-card border p-8 rounded-lg">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-muted-foreground">問題 {idx + 1}/{totalItems}</h3>
          <p className="mt-2 text-lg">{item.q}</p>
        </div>

        {item.imageUrl && (
          <div className="flex justify-center items-center mb-8 h-80 bg-muted rounded-lg p-2">
            <Image
              alt={item.imageAlt || 'Question image'}
              className="h-full w-auto object-contain rounded-md"
              src={item.imageUrl}
              width={800}
              height={320}
              priority
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {item.choices.map((choice, i) => (
            <Button
              key={i}
              variant={getButtonVariant(i)}
              className={cn('text-left justify-start h-auto py-4', {
                'ring-2 ring-ring': selected === i && step === 'quiz',
              })}
              onClick={() => step === 'quiz' && select(i)}
              disabled={step === 'result'}
            >
              <span className="font-mono">{String.fromCharCode(65 + i)}. {choice}</span>
            </Button>
          ))}
        </div>

        {step === 'result' && (
          <div className="mb-8 p-4 rounded-lg bg-muted">
            <h4 className="font-bold text-lg mb-2 flex items-center">
              {selected === item.answer ? (
                <CheckCircle2 className="text-green-500 mr-2" />
              ) : (
                <XCircle className="text-red-500 mr-2" />
              )}
              {selected === item.answer ? '正解' : '不正解'}
            </h4>
            <p className="text-muted-foreground">{item.exp}</p>
          </div>
        )}

        <div className="flex justify-end items-center space-x-4">
          <Button variant="outline" onClick={() => setShowHint(true)} disabled={showHint}>
            ヒント
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={step === 'quiz' ? onSubmit : onNext}
            disabled={selected === undefined}
          >
            {step === 'quiz' ? '解答' : '次の問題へ'}
          </Button>
        </div>

        {showHint && (
           <div className="mt-6 p-4 rounded-lg bg-muted border">
            <h4 className="font-bold mb-2">ヒント</h4>
            <p className="text-muted-foreground">{item.exp}</p>
            <Button variant="link" onClick={() => setShowHint(false)} className="p-0 h-auto mt-2">閉じる</Button>
          </div>
        )}
      </div>
    </main>
  )
}





