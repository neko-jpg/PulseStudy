"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { useEffect, useState } from 'react'

export function AssignmentAnalyticsModal({ open, onOpenChange, id }: { open: boolean; onOpenChange: (b: boolean) => void; id?: string | null }) {
  const [data, setData] = useState<{ points: any[]; avg: { acc: number; flow: number } } | null>(null)
  useEffect(() => {
    if (!open || !id) return
    setData(null)
    fetch(`/api/assignments/${id}/analytics`, { cache: 'no-store' }).then(r => r.json()).then(setData)
  }, [open, id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>課題の簡易分析</DialogTitle></DialogHeader>
        {!data ? (
          <div className="text-sm text-muted-foreground">読み込み中…</div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm">平均 正答 {data.avg.acc}% / Flow {data.avg.flow}%</div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.points}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="acc" stroke="#82ca9d" name="正答%" />
                  <Line type="monotone" dataKey="flow" stroke="#8884d8" name="Flow%" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

