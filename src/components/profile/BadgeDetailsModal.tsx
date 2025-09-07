"use client"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'

type Detail = { id:string; name:string; desc:string; conditions:string[]; progress:{value:number; target:number} }

export function BadgeDetailsModal({ open, onOpenChange, id }: { open:boolean; onOpenChange:(b:boolean)=>void; id?:string|null }) {
  const [data, setData] = useState<Detail | null>(null)
  useEffect(() => {
    if (!id || !open) return
    setData(null)
    fetch(`/api/profile/badges/details?id=${id}`, { cache:'no-store' }).then(r=>r.json()).then(setData)
  }, [id, open])
  const pct = data ? Math.min(100, Math.round((data.progress.value / Math.max(1, data.progress.target)) * 100)) : 0
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>バッジ詳細</DialogTitle></DialogHeader>
        {!data ? (
          <div className="text-sm text-muted-foreground">読み込み中…</div>
        ) : (
          <div className="text-sm space-y-2">
            <div className="font-medium">{data.name}</div>
            <div className="text-muted-foreground">{data.desc}</div>
            <div className="mt-2">条件</div>
            <ul className="list-disc pl-5">
              {data.conditions.map((c,i)=>(<li key={i}>{c}</li>))}
            </ul>
            <div className="mt-2">進捗 {pct}%</div>
            <Progress value={pct} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

