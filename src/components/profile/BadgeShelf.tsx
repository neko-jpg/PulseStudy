"use client"

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BadgeDetailsModal } from './BadgeDetailsModal'

type Badge = { id: string; name: string; desc: string; earned: boolean; earnedAt?: number, icon?: string }

const badgeIcons: { [key: string]: string } = {
  'kaiden-star': 'star',
  'streak-king': 'local_fire_department',
  'focus-master': 'psychology',
  'default': 'emoji_events'
};

export function BadgeShelf() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Badge[]>([])
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/profile/badges', { cache: 'no-store' })
      .then(r => r.json())
      .then(j => {
        if (active) {
          const badgesWithIcons = (j.items || []).map((b: Badge) => ({ ...b, icon: badgeIcons[b.id] || badgeIcons.default }))
          setItems(badgesWithIcons)
          setLoading(false)
        }
      })
    return () => { active = false }
  }, [])

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">バッジ</h3>
      {loading ? (
        <div className="grid grid-cols-3 gap-4 text-center">
          <Skeleton className="w-20 h-20 rounded-full mx-auto" />
          <Skeleton className="w-20 h-20 rounded-full mx-auto" />
          <Skeleton className="w-20 h-20 rounded-full mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 text-center">
          {items.map(b => (
            <button
              key={b.id}
              className={!b.earned ? 'opacity-40' : ''}
              title={b.desc}
              aria-label={`${b.name} ${b.earned ? '獲得済み' : '未獲得'}`}
              onClick={() => { setActiveId(b.id); setOpen(true) }}
            >
              <div className="w-20 h-20 mx-auto bg-slate-600 rounded-full flex items-center justify-center">
                <span className="material-icons text-4xl text-slate-400">{b.icon}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">{b.name}</p>
            </button>
          ))}
        </div>
      )}
      <BadgeDetailsModal open={open} onOpenChange={setOpen} id={activeId} />
    </Card>
  )
}
