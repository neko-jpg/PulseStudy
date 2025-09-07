"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AlarmClock } from 'lucide-react'

export function BestTimeCard() {
  const [data, setData] = useState<{ slot:string, score:number, reason:string } | null>(null)
  useEffect(() => { fetch('/api/profile/best-time').then(r=>r.json()).then(setData) }, [])
  if (!data) return null
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-semibold mb-1 flex items-center gap-2"><AlarmClock className="h-4 w-4" /> ベスト学習時間帯</div>
        <div className="text-sm">{data.slot}（推定スコア {Math.round(data.score*100)}%）</div>
        <div className="text-xs text-muted-foreground mt-1">{data.reason}</div>
      </CardContent>
    </Card>
  )
}

