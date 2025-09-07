"use client"

import { Card, CardContent } from '@/components/ui/card'

export function ClassSummaryCards({ mins, acc, flow }: { mins: number; acc: number; flow: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">今日/今週の学習分</div><div className="text-2xl font-bold">{mins}分</div></CardContent></Card>
      <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">平均正答率</div><div className="text-2xl font-bold">{Math.round(acc*100)}%</div></CardContent></Card>
      <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">平均没入度</div><div className="text-2xl font-bold">{flow}%</div></CardContent></Card>
    </div>
  )
}

