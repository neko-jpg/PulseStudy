"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, CheckCircle2, Timer } from 'lucide-react'

export function SummaryCards({
  mins,
  acc,
  flow,
  onOpen,
}: {
  mins: number
  acc: number
  flow: number
  onOpen: (metric: 'mins' | 'acc' | 'flow') => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card role="button" onClick={() => onOpen('mins')} aria-label="学習時間の詳細">
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground">学習時間</div>
          <div className="text-2xl font-bold flex items-center gap-2"><Timer className="h-5 w-5" /> {mins}分</div>
          <Button size="sm" variant="ghost" className="px-0 mt-1">詳細を見る</Button>
        </CardContent>
      </Card>
      <Card role="button" onClick={() => onOpen('acc')} aria-label="正答率の詳細">
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground">正答率</div>
          <div className="text-2xl font-bold flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> {Math.round(acc * 100)}%</div>
          <Button size="sm" variant="ghost" className="px-0 mt-1">詳細を見る</Button>
        </CardContent>
      </Card>
      <Card role="button" onClick={() => onOpen('flow')} aria-label="週間平均集中度の詳細">
        <CardContent className="p-4">
          <div className="text-xs text-muted-foreground">週間平均集中度</div>
          <div className="text-2xl font-bold flex items-center gap-2"><Activity className="h-5 w-5" /> {flow}%</div>
          <Button size="sm" variant="ghost" className="px-0 mt-1">詳細を見る</Button>
        </CardContent>
      </Card>
    </div>
  )
}

