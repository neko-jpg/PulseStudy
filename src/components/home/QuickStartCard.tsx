"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Timer, BarChart3, Play } from 'lucide-react'
import type { ModuleSummary } from '@/store/homeStore'
import { useEffect, useRef, useState } from 'react'

type Props = {
  data?: ModuleSummary | null
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  onQuickStart?: () => void
}

export function QuickStartCard({ data, loading, error, onRetry, onQuickStart }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!ref.current || sent || !data?.moduleId) return
    const el = ref.current
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !sent) {
          setSent(true)
          import('@/lib/analytics').then((m) =>
            m.track({ name: 'home_impression_quickstart', props: { moduleId: data.moduleId } })
          )
          obs.disconnect()
        }
      })
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [data?.moduleId, sent])

  if (loading) {
    return (
      <Card aria-busy="true" aria-live="polite">
        <CardHeader>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-4/5 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card role="alert" aria-live="polite">
        <CardContent className="pt-6">
          <div className="text-sm mb-3">読み込みに失敗しました。</div>
          <Button variant="secondary" onClick={onRetry}>再試行</Button>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card ref={ref as any}>
      <CardHeader>
        <div className="text-xs text-muted-foreground">続きから</div>
        <CardTitle className="text-base">{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1"><Timer className="h-4 w-4" /> {data.estMins}分</div>
          <div className="flex items-center gap-1"><BarChart3 className="h-4 w-4" /> {data.questions}問</div>
        </div>
        <Link href={`/learn?module=last`} aria-label="続きから始める" onClick={onQuickStart}>
          <Button className="w-full" role="button"><Play className="h-4 w-4 mr-2" /> 続きから始める</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
