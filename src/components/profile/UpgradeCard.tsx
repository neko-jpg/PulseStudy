"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'

export function UpgradeCard({ onUpgraded }: { onUpgraded: () => void }) {
  const [loading, setLoading] = useState(false)
  async function upgrade() {
    try { setLoading(true); const res = await fetch('/api/billing/upgrade', { method:'POST' }); if (res.ok) onUpgraded() } finally { setLoading(false) }
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-semibold mb-1 flex items-center gap-2"><Sparkles className="h-4 w-4" /> Plusへアップグレード</div>
        <div className="text-sm text-muted-foreground">ベスト学習時間帯の提案や高度な分析、共有プロフィールの拡張などが利用可能に。</div>
        <div className="mt-2"><Button onClick={upgrade} disabled={loading}>{loading ? '処理中…' : '今すぐアップグレード'}</Button></div>
      </CardContent>
    </Card>
  )
}

