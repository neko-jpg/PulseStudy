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
    <Card className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 border-0">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">Plusへアップグレード</h3>
          <p className="text-blue-200">詳細な学習分析やプロフィール閲覧権限などをアンロック</p>
        </div>
        <Button onClick={upgrade} disabled={loading} className="bg-white text-blue-600 font-bold hover:bg-gray-200">
          {loading ? '処理中…' : '詳しく見る'}
        </Button>
      </div>
    </Card>
  )
}

