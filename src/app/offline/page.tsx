"use client"

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'

function OfflineInner() {
  const params = useSearchParams()
  const from = params.get('from') || '/'
  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h1 className="text-xl font-semibold mb-2">オフラインです</h1>
      <p className="text-sm text-muted-foreground mb-4">ネットワークに接続してから再試行してください。</p>
      <div className="flex gap-2 justify-center">
        <Button onClick={() => location.reload()}>再試行</Button>
        <Link href={from}><Button variant="secondary">戻る</Button></Link>
      </div>
    </div>
  )
}

export default function OfflinePage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">読み込み中…</div>}>
      <OfflineInner />
    </Suspense>
  )
}
