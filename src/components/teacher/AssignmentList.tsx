"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTeacherStore } from '@/store/teacher'
import { track } from '@/lib/analytics'
import { useState } from 'react'
import dynamic from 'next/dynamic'
const AssignmentAnalyticsModal = dynamic(() => import('./AssignmentAnalyticsModal').then(m => m.AssignmentAnalyticsModal), { ssr: false })

export function AssignmentList() {
  const items = useTeacherStore(s => s.assignments)
  const publish = useTeacherStore(s => s.publishAssignment)
  const [analysis, setAnalysis] = useState<{ open: boolean; id?: string|null }>({ open: false })
  async function doPublish(id: string) {
    await fetch(`/api/assignments/${id}/publish`, { method: 'POST' })
    publish(id)
    track({ name: 'assign_publish', props: { id } })
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-semibold mb-2">課題</div>
        <div className="grid gap-2">
          {items.map(a => (
            <div key={a.id} className="flex items-center justify-between text-sm border rounded p-2">
              <div>
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-muted-foreground">状態: {a.status}{a.dueAt?` / 締切: ${a.dueAt.slice(0,10)}`:''}</div>
              </div>
              <div className="flex items-center gap-2">
                {a.status === 'draft' ? <Button size="sm" onClick={()=>doPublish(a.id)}>公開</Button> : <span className="text-xs text-green-600">公開済み</span>}
                {a.status === 'published' && <Button size="sm" variant="outline" onClick={()=>setAnalysis({ open: true, id: a.id })}>分析</Button>}
              </div>
            </div>
          ))}
          {!items.length && <div className="text-sm text-muted-foreground">課題がありません</div>}
        </div>
        <AssignmentAnalyticsModal open={analysis.open} onOpenChange={(o)=>setAnalysis(s=>({ ...s, open:o }))} id={analysis.id} />
      </CardContent>
    </Card>
  )
}
