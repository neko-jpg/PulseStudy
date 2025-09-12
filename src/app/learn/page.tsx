"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, XCircle, HelpCircle, Lightbulb, Bot } from 'lucide-react'
import { useLearnStore } from '@/store/learn'
import { useSessionStore } from '@/store/sessionStore'
import { flush, setupFlushListeners } from '@/lib/quizQueue'
import { cn } from '@/lib/utils'
import { useQuizModule } from '@/hooks/useQuizModule'
import { useQuizEngine } from '@/hooks/useQuizEngine'
import { useAIFeedback } from '@/hooks/useAIFeedback'
import { useFocusAdaptive } from '@/hooks/useFocusAdaptive'

export default function LearnPage() {
  const router = useRouter()
  const params = useSearchParams()
  // Demo-safe default subject fallback to avoid dead-ends
  useEffect(() => {
    try {
      const sid = params.get('subjectId')
      if (!sid) router.replace('/learn?subjectId=math-ii')
    } catch {}
  }, [params, router])
  const moduleParam = params.get('module') || 'quad-basic'
  const roomParam = params.get('room') || ''
  const { doc, loading, error } = useQuizModule(moduleParam)
  const { aiFeedback, isAiFeedbackLoading, fetchFeedback } = useAIFeedback()
  const { moduleId } = useLearnStore()
  const { startSession, finalizeSession, status: sessionStatus } = useSessionStore()
  const [showHint, setShowHint] = useState(false)
  const [showBreak, setShowBreak] = useState(false)

  useEffect(() => {
    flush()
    const cleanup = setupFlushListeners()
    return () => { if (typeof cleanup === 'function') cleanup() }
  }, [])

  useEffect(() => {
    if (doc?.id) startSession(doc.id)
    return () => { if (sessionStatus === 'in_progress') finalizeSession('aborted') }
  }, [doc?.id, startSession, finalizeSession, sessionStatus])

  const { step, idx, selected, currentItem: item, totalItems, progressPercentage, select, handleSubmit, handleNext } = useQuizEngine(doc, {
    onComplete: (m) => router.push(`/learn/${m}/results`),
    onFeedback: ({ question, answer }) => fetchFeedback({ question, answer, subject: doc?.subject || '' }),
  })

  // Progress sync to room if provided
  useEffect(() => {
    if (!roomParam || !doc?.id) return
    try { fetch(`/api/rooms/${roomParam}/progress`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ moduleId: doc.id, idx }) }) } catch {}
  }, [roomParam, doc?.id, idx])

  // Focus低下時の簡易介入（ヒント表示 or 休憩カード）
  useFocusAdaptive(() => {
    if (step === 'quiz') {
      setShowHint(true)
      setShowBreak(true)
    }
  }, { threshold: 0.35, streak: 3 })

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

  if (error || !doc) {
    return (
      <div className="p-6 text-center">
        <div className="mb-3">読み込みに失敗しました</div>
        <Button onClick={() => location.reload()}>再試行</Button>
      </div>
    )
  }

  const getButtonVariant = (i: number) => {
    if (!item) return 'secondary' as const
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
            <p className="text-muted-foreground mr-4">{doc.subject} {idx + 1}/{totalItems}</p>
            <div className="w-64 h-2 bg-secondary rounded-full">
              <div className="h-full bg-primary rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" className="bg-yellow-400 text-black hover:bg-yellow-500"><Lightbulb /></Button>
          <Button variant="outline" size="icon"><Bot /></Button>
          <Button variant="outline" size="icon"><HelpCircle /></Button>
        </div>
      </header>

      <div className="bg-card border p-8 rounded-lg">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-muted-foreground">問題 {idx + 1}/{totalItems}</h3>
          <p className="mt-2 text-lg">{item?.q}</p>
        </div>

        {item?.imageUrl && (
          <div className="flex justify-center items-center mb-8 h-80 bg-muted rounded-lg p-2">
            <Image alt={item.imageAlt || 'Question image'} className="h-full w-auto object-contain rounded-md" src={item.imageUrl} width={800} height={320} priority />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {item?.choices.map((choice, i) => (
            <Button key={i} variant={getButtonVariant(i)} className={cn('text-left justify-start h-auto py-4', { 'ring-2 ring-ring': selected === i && step === 'quiz' })} onClick={() => step === 'quiz' && select(i)} disabled={step === 'result'}>
              <span className="font-mono">{String.fromCharCode(65 + i)}. {choice}</span>
            </Button>
          ))}
        </div>

        {step === 'result' && item && (
          <div className="mb-8 p-4 rounded-lg bg-muted">
            <h4 className="font-bold text-lg mb-2 flex items-center">
              {selected === item.answer ? (<CheckCircle2 className="text-green-500 mr-2" />) : (<XCircle className="text-red-500 mr-2" />)}
              {selected === item.answer ? '正解' : '不正解'}
            </h4>
            <p className="text-muted-foreground">{item.exp}</p>
          </div>
        )}

        {isAiFeedbackLoading && (
          <Alert className="mb-8"><Bot className="h-4 w-4" /><AlertTitle>AIがフィードバックを生成中...</AlertTitle><AlertDescription><Skeleton className="h-4 w-full mt-2" /><Skeleton className="h-4 w-2/3 mt-2" /></AlertDescription></Alert>
        )}
        {aiFeedback && !isAiFeedbackLoading && (
          <Alert className="mb-8"><Bot className="h-4 w-4" /><AlertTitle>AIからのアドバイス</AlertTitle><AlertDescription>{aiFeedback}</AlertDescription></Alert>
        )}

        <div className="flex justify-end items-center space-x-4">
          <Button variant="outline" onClick={() => setShowHint(true)} disabled={showHint}>ヒント</Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={step === 'quiz' ? handleSubmit : handleNext} disabled={selected === undefined}>{step === 'quiz' ? '解答' : '次の問題へ'}</Button>
        </div>

        {showHint && item && (
          <div className="mt-6 p-4 rounded-lg bg-muted border">
            <h4 className="font-bold mb-2">ヒント</h4>
            <p className="text-muted-foreground">{item.exp}</p>
            <Button variant="link" onClick={() => setShowHint(false)} className="p-0 h-auto mt-2">閉じる</Button>
          </div>
        )}
        {showBreak && (
          <div className="mt-6 p-4 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
            <h4 className="font-bold mb-2">ちょっと休憩しましょう（30秒）</h4>
            <p className="mb-2 text-sm">目を休めて深呼吸。戻ったらヒントを読んで再挑戦！</p>
            <Button size="sm" onClick={() => setShowBreak(false)}>続ける</Button>
          </div>
        )}
      </div>
    </main>
  )
}
