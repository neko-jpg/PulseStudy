"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Timer, BarChart3 } from 'lucide-react'
import type { ModuleSummary } from '@/store/homeStore'
import { useEffect, useRef, useState } from 'react'

type Props = {
  module?: ModuleSummary
  loading?: boolean
  onClick?: () => void
  onImpression?: () => void
}

export function TaskCard({ module, loading, onClick, onImpression }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!ref.current || sent || !onImpression) return
    const el = ref.current
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !sent) {
          setSent(true)
          onImpression()
          obs.disconnect()
        }
      })
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [onImpression, sent])

  if (loading) {
    return (
      <Card aria-busy="true" aria-live="polite">
        <CardHeader>
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-3/4 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!module) return null

  return (
    <div ref={ref}>
      <Card>
        <CardHeader>
          <div className="text-xs text-muted-foreground">{module.subject}</div>
          <CardTitle className="text-base">{module.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1"><Timer className="h-4 w-4" /> {module.estMins}分</div>
            <div className="flex items-center gap-1"><BarChart3 className="h-4 w-4" /> {module.questions}問</div>
          </div>
          <Link href={`/learn?module=${module.moduleId}`} aria-label="このモジュールを始める" onClick={onClick}>
            <Button variant="secondary" className="w-full" role="button">始める</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
