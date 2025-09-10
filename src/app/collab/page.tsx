"use client"

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { track } from '@/lib/analytics';
import { ActionCard } from '@/components/collab-lobby/ActionCard';
import { PlusCircle, LogIn, Search, Bell } from 'lucide-react';

function LobbyInner() {
  const router = useRouter();
  const { toast } = useToast();
  const [openJoin, setOpenJoin] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [searchItems, setSearchItems] = useState<{ id: string; name?: string; host?: string; headcount?: number }[]>([]);

  async function onCreate() {
    try {
      const r = await fetch('/api/rooms', { method: 'POST' });
      const js = await r.json();
      track({ name: 'room_create', props: { id: js.id } });
      router.push(`/collab/room/${js.id}`);
    } catch {
      toast({ description: 'ルーム作成に失敗しました' });
    }
  }

  function parseIdFromInput(v: string): string | null {
    const s = v.trim();
    if (!s) return null;
    try {
      const u = new URL(s);
      const m = u.pathname.match(/\/collab\/room\/([^/]+)/);
      if (m) return m[1];
    } catch {}
    if (/^[A-Za-z0-9_-]{4,32}$/.test(s)) return s;
    if (/^\d{6}$/.test(s)) return `code-${s}`;
    return null;
  }

  async function onJoin() {
    const id = parseIdFromInput(joinCode);
    if (!id) { toast({ description: 'URLまたはコードを確認してください' }); return; }
    track({ name: 'room_join', props: { id, via: 'code' } });
    router.push(`/collab/room/${id}`);
  }

  async function onSearch() {
    const q = searchQ.trim();
    const r = await fetch(`/api/rooms/search?q=${encodeURIComponent(q)}`);
    const js = await r.json();
    setSearchItems(js.items || []);
    track({ name: 'room_search', props: { q } });
  }

  return (
    <div className="bg-gray-900 flex-1 p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">こんばんは、葵さん。</h2>
        </div>
        <button className="relative">
          <Bell className="text-gray-400 text-3xl" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </header>
      <div className="bg-gray-800/50 rounded-xl p-8">
        <h3 className="text-3xl font-bold mb-2">コラボロビー</h3>
        <p className="text-gray-400 mb-8">学習仲間を「作る」「入る」「探す」という3つの方法で探すことができます。</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ActionCard
            icon={PlusCircle}
            title="ルームを築く"
            description="自分で新しい学習グループやルームを作成します。"
            iconBgClass="bg-blue-500/20"
            iconFgClass="text-blue-400"
            onClick={onCreate}
          />

          <Dialog open={openJoin} onOpenChange={setOpenJoin}>
            <DialogTrigger asChild>
              <ActionCard
                icon={LogIn}
                title="入室する"
                description="ルームIDや合言葉で特定のルームに参加します。"
                iconBgClass="bg-green-500/20"
                iconFgClass="text-green-400"
              />
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
              <ActionCard
                icon={Search}
                title="探す"
                description="公開されている既存のルームを検索します。"
                iconBgClass="bg-purple-500/20"
                iconFgClass="text-purple-400"
              />
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
    </div>
  );
}

export default function CollabLobbyPage() {
  return (
    <Suspense fallback={<div className="p-6">読み込み中…</div>}>
      <LobbyInner />
    </Suspense>
  );
}
