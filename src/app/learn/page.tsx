"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, XCircle, ArrowLeft, Brain, HelpCircle } from 'lucide-react'
import type { ModuleDoc } from '@/lib/types'
import { useLearnStore } from '@/store/learn'
import { track } from '@/lib/analytics'
import Link from 'next/link'
import { enqueue, flush, setupFlushListeners } from '@/lib/quizQueue'
import { useToast } from '@/hooks/use-toast'
import './learn.css'

export default function LearnPage() {
  const router = useRouter()
  const { toast } = useToast()
  const params = useSearchParams()
  const moduleParam = params.get('module') || 'quad-basic'
  const [doc, setDoc] = useState<ModuleDoc | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const qHeadingRef = useRef<HTMLDivElement | null>(null)
  const [aiFeedback, setAiFeedback] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  const [hideHint, setHideHint] = useState(false)
  const {
    moduleId,
    step,
    idx,
    selected,
    submitting,
    showExplain,
    correct,
    total,
    init,
    nextStep,
    select,
    setSubmitting,
    toggleExplain,
    setStep,
    markResult,
  } = useLearnStore()

  // Fetch module
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
        init(json.id)
        track({ name: 'module_step_view', props: { step: 'explain', idx: 0, moduleId: json.id } })
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

  // Setup flush for queued attempts
  useEffect(() => {
    flush()
    const cleanup = setupFlushListeners()
    return () => { if (typeof cleanup === 'function') cleanup() }
  }, [])

  const totalItems = doc?.items.length ?? 0
  const progress = useMemo(() => (totalItems ? Math.round((idx / totalItems) * 100) : 0), [idx, totalItems])

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (step === 'quiz') {
        if (e.key >= '1' && e.key <= '4') select(parseInt(e.key, 10) - 1)
        if (e.key === 'Enter') onSubmit()
      }
      if (step === 'result' && (e.key === 'n' || e.key === 'N' || e.key === 'Enter')) onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, select])

  // Focus management for question heading
  useEffect(() => {
    if (step === 'quiz' && qHeadingRef.current) qHeadingRef.current.focus()
  }, [step, idx])

  // Load AI feedback on mistake (keep before early returns to preserve hook order)
  useEffect(() => {
    if (!doc) return
    const it = doc.items[idx]
    if (step === 'result' && selected != null && selected !== it.answer) {
      let cancelled = false
      async function run() {
        try {
          setAiLoading(true); setAiFeedback(null)
          const res = await fetch('/api/ai/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              question: it.q,
              userAnswer: it.choices[(selected as number)] ?? '',
              subject: doc?.subject || '�w�K',
              difficulty: 'medium',
              hintsUsed: 0,
            }),
          })
          if (!cancelled && res.ok) { const j = await res.json(); setAiFeedback(j.feedback || null) }
        } catch { /* noop */ } finally { if (!cancelled) setAiLoading(false) }
      }
      run()
      return () => { cancelled = true }
    } else {
      setAiFeedback(null); setAiLoading(false)
    }
  }, [step, idx, selected, doc])

  function onGoHome() {
    router.push('/home')
  }

  function onNext() {
    if (!doc) return
    if (step === 'result' && idx + 1 >= doc.items.length) {
      toast({ description: '学習を完了しました。分析画面に移動します。' })
      router.push('/analytics')
      return
    }
    nextStep(doc.items.length)
    const nowStep = step === 'result' ? 'explain' : step === 'quiz' ? 'result' : 'quiz'
    track({ name: 'module_step_view', props: { step: nowStep, idx: step === 'result' ? idx + 1 : idx, moduleId } })
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
    track({ name: 'quiz_submit', props: { correct: isCorrect, idx, moduleId } })
    setSubmitting(false)
    setStep('result')
  }

  function onToggleExplain() {
    toggleExplain()
    track({ name: 'quiz_explain_expand', props: { idx, moduleId } })
  }

  function onFlow(kind: 'focused' | 'bored' | 'confused') {
    track({ name: `suggest_stop_${kind}` })
  }

  if (loading) {
    return (
      <div className="module-container p-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-48 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
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
  const useEffect_moved = (..._args: any[]) => { /* moved to maintain hook order */ }

  // Load AI feedback on mistake
  useEffect_moved(() => {
    if (!doc) return;
    const it = doc.items[idx];
    if (step === "result" && selected != null && selected !== it.answer) {
      let cancelled = false;
      async function run() {
        try {
          setAiLoading(true); setAiFeedback(null);
          const res = await fetch("/api/ai/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: it.q, userAnswer: it.choices[(selected as number)] ?? "", subject: (doc?.subject) || "学習", difficulty: "medium", hintsUsed: 0 }) });
          if (!cancelled && res.ok) { const j = await res.json(); setAiFeedback(j.feedback || null) }
        } catch { /* noop */ } finally { if (!cancelled) setAiLoading(false) }
      }
      run();
      return () => { cancelled = true }
    } else {
      setAiFeedback(null); setAiLoading(false);
    }
  }, [step, idx, selected, doc])

  return (
    <div className="module-container">
      <header className="module-header">
        <div className="header-left">
          <button className="back-button" onClick={onGoHome} aria-label="ホームに戻る">
            <ArrowLeft size={20} />
          </button>
          <div className="module-info">
            <h1>{doc.title}</h1>
            <div className="module-meta">
              <span>{doc.subject ?? '学習'}</span>
              <span>{idx + 1} / {doc.items.length}</span>
            </div>
          </div>
        </div>
        <div className="flow-meter" role="group" aria-label="Flow申告">
          <button className="flex items-center gap-1" onClick={() => onFlow('focused')} aria-label="集中している"><Brain size={16} /> 集中</button>
          <button className="ml-3 text-xs" onClick={() => onFlow('bored')} aria-label="退屈">退屈</button>
          <button className="ml-2 text-xs" onClick={() => onFlow('confused')} aria-label="困っている">困った</button>
        </div>
      </header>

      <div className="progress-container">
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        <div className="progress-steps"><span>解説</span><span>クイズ</span><span>結果</span></div>
      </div>

      <main className="module-content p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {step === 'explain' && '要点'}
              {step === 'quiz' && '設問'}
              {step === 'result' && '結果'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'explain' && (
              <div>
                <ul className="list-disc pl-5 mb-4">
                  {doc.explain.map((t, i) => (<li key={i}>{t}</li>))}
                </ul>
                <Button onClick={() => { nextStep(doc.items.length); track({ name: 'module_step_view', props: { step: 'quiz', idx, moduleId } }) }}>問題へ</Button>
              </div>
            )}

            {step === 'quiz' && (
              <div>
                <div ref={qHeadingRef as any} tabIndex={-1} className="font-medium mb-4 outline-none">{item.q}</div>
                <div className="grid gap-2">
                  {item.choices.map((c, i) => (
                    <Button key={i} variant={selected === i ? 'secondary' : 'outline'} onClick={() => select(i)} role="radio" aria-checked={selected === i}>
                      {i + 1}. {c}
                    </Button>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button onClick={onSubmit} disabled={selected == null || submitting}>送信</Button>
                  <Link href={`/collab?room=new&module=${moduleId}`} className="inline-flex items-center gap-1 text-sm" onClick={() => track({ name: 'module_click_help_collab', props: { moduleId } })}>
                    <HelpCircle className="h-4 w-4" /> ヘルプ・コラボ
                  </Link>
                </div>
              </div>
            )}

            {step === 'result' && (
              <div>
                <div className="flex items-center gap-2" aria-live="polite">
                  {selected === item.answer ? (
                    <><CheckCircle2 className="text-green-600" /> 正解</>
                  ) : (
                    <><XCircle className="text-red-600" /> 不正解</>
                  )}
                </div>
                <Accordion type="single" collapsible className="mt-3">
                  <AccordionItem value="exp">
                    <AccordionTrigger onClick={onToggleExplain}>解説をみる</AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm text-muted-foreground">{item.exp}</div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                {!aiLoading && aiFeedback && (
                  <div className="mt-3 p-3 rounded bg-muted text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <span><span className="font-medium">AIヒント:</span> {aiFeedback}</span>
                      <button className="text-xs underline" onClick={() => setHideHint(true)} aria-label="ヒントを閉じる">閉じる</button>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex items-center gap-3">
                  <Button onClick={onNext}>次の問題へ</Button>
                  <div className="text-sm text-muted-foreground">スコア: {correct}/{total}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 flex items-center justify-between">
          <Button variant="ghost" onClick={onGoHome}>やめる</Button>
          <Link href="/home"><Button variant="outline">ホーム</Button></Link>
        </div>
      </main>
    </div>
  )
}





