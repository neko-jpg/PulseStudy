"use client"

import { Button } from '@/components/ui/button'

export function ShareBar({ onShare }: { onShare: (url: string) => void }) {
  async function share() {
    try {
      const res = await fetch('/api/share/analytics', { method: 'POST' })
      if (!res.ok) throw new Error('fail')
      const json = await res.json()
      onShare(json.shareUrl)
      import('@/lib/analytics').then((m) => m.track({ name: 'analytics_share_generate' }))
      try {
        if (navigator.share) await navigator.share({ title: '学習の成果', url: json.shareUrl })
        else await navigator.clipboard.writeText(json.shareUrl)
      } catch {}
    } catch {}
  }
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">結果を共有してモチベを上げよう</div>
      <Button onClick={share}>結果を共有</Button>
    </div>
  )
}

