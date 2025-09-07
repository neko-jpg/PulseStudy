"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function PublicProfilePage() {
  const { handle } = useParams<{ handle: string }>()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/public/profile?handle=@${handle}`, { cache: 'no-store' }).then(r => r.json()).then(j => { setData(j); setLoading(false) })
  }, [handle])

  if (loading) return <div className="p-6"><Skeleton className="h-24 w-full" /></div>
  if (!data) return null
  return (
    <div className="p-4 space-y-3">
      <Card className="p-4">
        <div className="text-base font-semibold">{data.user.name} <span className="text-xs text-muted-foreground">{data.user.handle}</span></div>
        <div className="text-xs text-muted-foreground mt-1">合計 {data.summary.mins}分 / 正答 {Math.round(data.summary.acc*100)}% / 連続 {data.summary.streak}日</div>
      </Card>
      <Card className="p-4">
        <div className="font-semibold mb-2">獲得バッジ</div>
        <div className="grid grid-cols-3 gap-3">
          {data.badges.map((b: any) => (<div key={b.id} className="rounded border p-2 text-center text-sm">{b.name}</div>))}
        </div>
      </Card>
    </div>
  )
}
