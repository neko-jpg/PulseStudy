"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function DataSection({ onExport, onDelete, exporting, deleting }: { onExport: () => void, onDelete: () => void, exporting?: boolean, deleting?: boolean }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">データ</h3>
      <div className="space-y-3">
        <button onClick={onExport} disabled={exporting} className="block text-blue-400 hover:text-blue-300 disabled:opacity-50">
          {exporting ? 'エクスポート中…' : 'エクスポート'}
        </button>
        <button onClick={handleLogout} className="block text-blue-400 hover:text-blue-300">
          ログアウト
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="block text-red-500 hover:text-red-400">
              アカウント削除
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>本当に削除しますか？</DialogTitle>
              <DialogDescription>この操作は取り消せません。学習データは論理削除されます。</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
              <Button variant="destructive" onClick={onDelete} disabled={deleting}>
                {deleting ? '削除中…' : '削除する'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  )
}

