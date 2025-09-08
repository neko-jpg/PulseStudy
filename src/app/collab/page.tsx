"use client"

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { track } from '@/lib/analytics'

function LobbyInner() {
  const router = useRouter()
  const { toast } = useToast()
  const [openJoin, setOpenJoin] = useState(false)
  const [openSearch, setOpenSearch] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [searchItems, setSearchItems] = useState<{ id: string; name?: string; host?: string; headcount?: number }[]>([])

  async function onCreate() {
    try {
      const r = await fetch('/api/rooms', { method: 'POST' })
      const js = await r.json()
      track({ name: 'room_create', props: { id: js.id } })
      router.push(`/collab/room/${js.id}`)
    } catch {
      toast({ description: 'ルーム作成に失敗しました' })
    }
  }

  function parseIdFromInput(v: string): string | null {
    const s = v.trim()
    if (!s) return null
    // allow full URL
    try {
      const u = new URL(s)
      const m = u.pathname.match(/\/collab\/room\/([^/]+)/)
      if (m) return m[1]
    } catch {}
    // accept raw id or 6-digit code (mock: maps to id)
    if (/^[A-Za-z0-9_-]{4,32}$/.test(s)) return s
    if (/^\d{6}$/.test(s)) return `code-${s}`
    return null
  }

  async function onJoin() {
    const id = parseIdFromInput(joinCode)
    if (!id) { toast({ description: 'URLまたはコードを確認してください' }); return }
    track({ name: 'room_join', props: { id, via: 'code' } })
    router.push(`/collab/room/${id}`)
  }

  async function onSearch() {
    const q = searchQ.trim()
    const r = await fetch(`/api/rooms/search?q=${encodeURIComponent(q)}`)
    const js = await r.json()
    setSearchItems(js.items || [])
    track({ name: 'room_search', props: { q } })
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-bold mb-2">コラボロビー</h1>
      <p className="text-muted-foreground mb-6">作る / 入る / 探す から選んでスタート</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button size="lg" onClick={onCreate}>① ルームを開く</Button>
        <Dialog open={openJoin} onOpenChange={setOpenJoin}>
          <DialogTrigger asChild>
            <Button size="lg" variant="secondary">② 入室する</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ルームに入る</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 mt-2">
              <Label htmlFor="code">招待URL または 6桁コード</Label>
              <Input id="code" placeholder="https://... または 123456" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onJoin() }} />
            </div>
            <DialogFooter>
              <Button onClick={onJoin}>入室</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={openSearch} onOpenChange={setOpenSearch}>
          <DialogTrigger asChild>
            <Button size="lg" variant="outline">③ 探す</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ルームを検索</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <Input placeholder="名前/タグ/作成者" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onSearch() }} />
              <Button onClick={onSearch}>検索</Button>
            </div>
            <div className="mt-4 grid gap-2 max-h-80 overflow-auto">
              {searchItems.map((it) => (
                <div key={it.id} className="flex items-center justify-between border rounded p-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{it.name || it.id}</div>
                    <div className="text-xs text-muted-foreground">{it.host || 'host'} ・ {it.headcount ?? 0}人</div>
                  </div>
                  <Button size="sm" onClick={() => { router.push(`/collab/room/${it.id}`); setOpenSearch(false) }}>参加</Button>
                </div>
              ))}
              {searchItems.length === 0 && <div className="text-sm text-muted-foreground">検索結果はありません</div>}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default function CollabLobbyPage() {
  return (
    <Suspense fallback={<div className="p-6">読み込み中…</div>}>
      <LobbyInner />
    </Suspense>
  )
}

