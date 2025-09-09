"use client"

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Activity } from 'lucide-react'

export function PulseCard({ value = 0, children }: { value?: number, children?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <div className="text-sm font-medium">集中度</div>
          </div>
          <div className="text-lg font-bold text-primary">{value}%</div>
        </div>
        <Progress value={value} aria-label={`集中度 ${value}%`} />
        {children}
        <Link href="/analytics" className="block text-xs text-muted-foreground mt-2" aria-label="分析を見る" onClick={() => import('@/lib/analytics').then(m=>m.track({name:'home_click_analytics'}))}>
          分析を見る
        </Link>
      </CardContent>
    </Card>
  )
}
