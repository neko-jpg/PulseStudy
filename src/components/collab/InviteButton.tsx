"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { track } from '@/lib/analytics'
import { useToast } from '@/hooks/use-toast'

export function InviteButton({ roomId }: { roomId: string }) {
  const [open, setOpen] = useState(false)
  const [invite, setInvite] = useState<{ url: string; code: string; token: string } | null>(null)
  const { toast } = useToast()

  async function openInvite() {
    try {
      const r = await fetch(`/api/rooms/${roomId}/invite`, { method: 'POST' })
      const js = await r.json()
      setInvite(js)
      setOpen(true)
      track({ name: 'room_invite_open', props: { roomId } })
    } catch {
      toast({ description: '招待の生成に失敗しました' })
    }
  }

  function copy(t: string, label: string) {
    navigator.clipboard.writeText(t).then(() => {
      toast({ description: `${label}をコピーしました` })
      track({ name: 'room_invite_copy', props: { roomId, label } })
    }).catch(() => {})
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" onClick={openInvite}>招待</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>招待リンク</DialogTitle>
        </DialogHeader>
        {invite ? (
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <input className="flex-1 border rounded px-2 py-1" value={invite.url} readOnly />
              <Button size="sm" onClick={() => copy(invite.url, 'URL')}>コピー</Button>
            </div>
            <div className="flex items-center gap-2">
              <input className="flex-1 border rounded px-2 py-1" value={invite.code} readOnly />
              <Button size="sm" onClick={() => copy(invite.code, 'コード')}>コピー</Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm">承認制</span>
              <input type="checkbox" onChange={async (e) => {
                const privacy = e.target.checked ? 'approval' : 'open'
                await fetch(`/api/rooms/${roomId}/privacy`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ privacy }) })
              }} aria-label="承認制にする" />
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">生成中…</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
