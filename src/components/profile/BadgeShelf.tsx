"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BadgeDetailsModal } from './BadgeDetailsModal'

type Badge = { id:string; name:string; desc:string; earned:boolean; earnedAt?:number }

export function BadgeShelf() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Badge[]>([])
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    fetch('/api/profile/badges', { cache:'no-store' }).then(r=>r.json()).then(j=>{ if(active) { setItems(j.items||[]); setLoading(false) } })
    return () => { active = false }
  }, [])
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-semibold mb-2">バッジ</div>
        {loading ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {items.map(b => (
              <button key={b.id} className={`rounded border p-2 text-center ${b.earned ? '' : 'opacity-50'}`} title={b.desc} aria-label={`${b.name} ${b.earned?'獲得済み':'未獲得'}`} onClick={()=>{ setActiveId(b.id); setOpen(true) }}>
                <div className="text-sm font-medium">{b.name}</div>
                <div className="text-[10px] text-muted-foreground">{b.earned ? '獲得済み' : '未獲得'}</div>
              </button>
            ))}
          </div>
        )}
        <BadgeDetailsModal open={open} onOpenChange={setOpen} id={activeId} />
      </CardContent>
    </Card>
  )
}
