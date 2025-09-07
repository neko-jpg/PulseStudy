"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ChallengeProgress } from '@/lib/types'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type Props = {
  open: boolean
  onOpenChange: (b: boolean) => void
  data?: ChallengeProgress | null
}

export function ProgressModal({ open, onOpenChange, data }: Props) {
  const chartData = (data?.friends ?? []).map((f) => ({ name: f.name, value: f.value }))
  if (data) chartData.push({ name: 'あなた', value: data.you })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ランキング/進捗</DialogTitle>
        </DialogHeader>
        {!data ? (
          <div className="text-sm text-muted-foreground">読み込み中…</div>
        ) : (
          <div className="space-y-3 text-sm">
            <div>あなたのランク: {data.rank} 位</div>
            <div>あなたのスコア: {data.you}</div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
