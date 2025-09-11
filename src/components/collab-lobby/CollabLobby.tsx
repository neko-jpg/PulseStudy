"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { track } from '@/lib/analytics';
import { ActionCard } from './ActionCard';
import { PlusCircle, LogIn, Search, Bell, Users } from 'lucide-react';
import { collection, query, where, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface RoomItem {
  id: string;
  topic?: string;
  hostId?: string;
  members?: any[];
}

export function CollabLobby() {
  const router = useRouter();
  const { toast } = useToast();
  const [openJoin, setOpenJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const [publicRooms, setPublicRooms] = useState<RoomItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "rooms"), where("privacy", "==", "open"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const roomsData: RoomItem[] = [];
      querySnapshot.forEach((doc: DocumentData) => {
        roomsData.push({ id: doc.id, ...doc.data() });
      });
      setPublicRooms(roomsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching real-time rooms:", error);
      toast({ variant: 'destructive', description: "ルームの取得に失敗しました。" });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  async function onCreate() {
    try {
      const r = await fetch('/api/rooms', { method: 'POST', body: JSON.stringify({ topic: '新しいルーム' }) , headers: {'Content-Type': 'application/json'} });
      if (!r.ok) throw new Error('Failed to create');
      const js = await r.json();
      track({ name: 'room_create', props: { id: js.id } });
      router.push(`/collab/room/${js.id}`);
    } catch {
      toast({ variant: 'destructive', description: 'ルーム作成に失敗しました' });
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
    if (/^[a-zA-Z0-9-]{4,32}$/.test(s)) return s;
    return null;
  }

  async function onJoin() {
    const id = parseIdFromInput(joinCode);
    if (!id) {
      toast({ variant: 'destructive', description: 'URLまたはルームIDの形式が正しくありません' });
      return;
    }
    track({ name: 'room_join', props: { id, via: 'code' } });
    router.push(`/collab/room/${id}`);
  }

  return (
    <main className="flex-1 p-4 sm:p-8 bg-gray-900 text-white">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">こんばんは、葵さん。</h2>
        </div>
        <button className="relative">
          <Bell className="text-gray-400 text-3xl" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </header>
      <div className="bg-gray-800/50 rounded-xl p-6 sm:p-8">
        <h3 className="text-3xl font-bold mb-2">コラボロビー</h3>
        <p className="text-gray-400 mb-8">
          学習仲間を「作る」「入る」か、下のリストから参加できます。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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
                description="ルームIDや招待URLで特定のルームに参加します。"
                iconBgClass="bg-green-500/20"
                iconFgClass="text-green-400"
              />
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ルームに入る</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2 mt-2">
                <Label htmlFor="code">招待URL または ルームID</Label>
                <Input
                  id="code"
                  placeholder="https://... または room-xxxxxx"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onJoin();
                  }}
                />
              </div>
              <DialogFooter>
                <Button onClick={onJoin}>入室</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <h4 className="text-2xl font-bold mb-4">公開中のルーム</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-700/40 rounded-lg p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4 bg-gray-600" />
                  <Skeleton className="h-4 w-1/2 bg-gray-600" />
                </div>
              ))
            ) : publicRooms.length > 0 ? (
              publicRooms.map((room) => (
                <div key={room.id} className="bg-gray-700/40 rounded-lg p-4 flex flex-col justify-between">
                  <div>
                    <div className="font-bold truncate">{room.topic || '無題のルーム'}</div>
                    <div className="text-sm text-gray-400 flex items-center mt-1">
                      <Users className="w-4 h-4 mr-2" />
                      {room.members?.length || 0}人
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => router.push(`/collab/room/${room.id}`)}
                  >
                    参加する
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 md:col-span-3">現在、参加可能な公開ルームはありません。</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
