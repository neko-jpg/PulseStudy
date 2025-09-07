"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { ChallengeItem } from '@/lib/types'
import { Award, Calendar, Trophy, CheckCircle2, Timer } from 'lucide-react'

type Props = {
  item: ChallengeItem
  onAccept: (item: ChallengeItem) => void
  onViewProgress: (id: string) => void
  onImpression?: (id: string) => void
}

function useCountdown(deadlineISO: string) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const remain = Math.max(0, new Date(deadlineISO).getTime() - now)
  const mm = Math.floor(remain / 60000)
  const ss = Math.floor((remain % 60000) / 1000)
  return { mm, ss }
}

export function ChallengeCard({ item, onAccept, onViewProgress, onImpression }: Props) {
  const pct = Math.min(100, Math.round((item.progress / Math.max(1, item.goal.value)) * 100))
  const deadline = new Date(item.deadline)
  const dd = `${deadline.getMonth() + 1}/${deadline.getDate()}`
  const { mm, ss } = useCountdown(item.deadline)

  // Impression tracking
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [sentImp, setSentImp] = useState(false)
  useEffect(() => {
    if (!rootRef.current || sentImp || !onImpression) return
    const el = rootRef.current
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !sentImp) {
          setSentImp(true)
          onImpression(item.id)
          obs.disconnect()
        }
      })
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [onImpression, sentImp, item.id])

  return (
    <div ref={rootRef}>
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="inline-flex items-center gap-2">
              {item.joined && <CheckCircle2 className="h-4 w-4 text-green-600" aria-label="参加済み" />}
              <span>{item.title}</span>
            </span>
            {item.reward?.badge && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Award className="h-4 w-4" />{item.reward.badge}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-2">{item.desc}</div>
          <div className="text-xs mb-2">目標: {item.goal.type}/{item.goal.value}</div>
          <div className="flex items-center gap-2 mb-2">
            <Progress value={pct} aria-label={`進捗 ${pct}%`} />
            <span className="text-xs">{pct}%</span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> 締切 {dd}</span>
            <span className="inline-flex items-center gap-1"><Timer className="h-3 w-3" /> 残り {mm}:{ss.toString().padStart(2, '0')}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <button className="underline text-xs" onClick={() => onViewProgress(item.id)} aria-label="ランキングを見る">ランキングを見る</button>
            {item.joined && <span className="text-xs text-green-600">参加済み</span>}
          </div>
          <Button className="w-full" onClick={() => onAccept(item)} aria-label="参加する" disabled={!!item.joined}><Trophy className="h-4 w-4 mr-1" /> {item.joined ? '参加済み' : '参加する'}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
