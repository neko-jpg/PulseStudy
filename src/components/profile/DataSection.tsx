"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'

export function DataSection({ onExport, onDelete, exporting, deleting }: { onExport: () => void, onDelete: () => void, exporting?: boolean, deleting?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-semibold mb-2">データ</div>
        <div className="flex items-center gap-2">
          <Button onClick={onExport} disabled={exporting} aria-label="データをエクスポート">{exporting ? 'エクスポート中…' : 'エクスポート'}</Button>
          <Button variant="destructive" onClick={() => setOpen(true)} aria-label="アカウント削除">アカウント削除</Button>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>本当に削除しますか？</DialogTitle>
              <DialogDescription>この操作は取り消せません。学習データは論理削除されます。</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
              <Button variant="destructive" onClick={onDelete} disabled={deleting}>削除する</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

