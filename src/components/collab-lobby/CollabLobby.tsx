"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import { PlusCircle, LogIn, Bell, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ActiveUserCounter } from '../common/ActiveUserCounter';

interface Room extends DocumentData {
  id: string;
  name?: string;
  description?: string;
  createdBy?: string;
  members?: string[];
}

export function CollabLobby() {
  const router = useRouter();
  const { toast } = useToast();
  const [openJoin, setOpenJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch rooms in real-time
  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      setRooms([]);
      return;
    }

    const q = query(collection(db, 'rooms'), where('isPublic', '==', true));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const roomsData: Room[] = [];
        querySnapshot.forEach((doc) => {
          roomsData.push({ id: doc.id, ...doc.data() } as Room);
        });
        setRooms(roomsData);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching rooms: ', error);
        toast({ variant: 'destructive', description: 'ルームの取得に失敗しました' });
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [toast]);

  async function onCreate() {
    try {
      const r = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-dev-uid': 'demo-uid' },
        body: JSON.stringify({ name: '新しい学習室', isPublic: true }),
      });
      if (!r.ok) throw new Error('Failed to create room');
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
    return null;
  }

  async function onJoin() {
    const id = parseIdFromInput(joinCode);
    if (!id) {
      toast({ description: 'URLまたはルームIDを確認してください' });
      return;
    }
    track({ name: 'room_join', props: { id, via: 'code' } });
    router.push(`/collab/room/${id}`);
  }

  return (
    <main className="flex-1 p-4 md:p-8 bg-gray-900 text-white">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">こんばんは、葵さん</h2>
        </div>
        <button className="relative">
          <Bell className="text-gray-400 text-3xl" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </header>

      <div className="bg-gray-800/50 rounded-xl p-6 md:p-8 mb-8">
        <h3 className="text-3xl font-bold mb-2">コラボロビー</h3>
        <p className="text-gray-400 mb-4">
          学習仲間を「作る」か「入る」か、下のリストから探すことができます。
        </p>
        <div className="mb-8">
          <ActiveUserCounter />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActionCard
            icon={PlusCircle}
            title="ルームを作る"
            description="自分で新しい学習グループやルームを作成します"
            iconBgClass="bg-blue-500/20"
            iconFgClass="text-blue-400"
            onClick={onCreate}
          />

          <Dialog open={openJoin} onOpenChange={setOpenJoin}>
            <DialogTrigger asChild>
              <ActionCard
                icon={LogIn}
                title="入室する"
                description="ルームIDや招待URLで特定のルームに参加します"
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
                  placeholder="https://... または room-..."
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
      </div>

      <div className="bg-gray-800/50 rounded-xl p-6 md:p-8">
        <h3 className="text-2xl font-bold mb-6">公開中のルーム</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)
          ) : rooms.length > 0 ? (
            rooms.map((room) => (
              <div
                key={room.id}
                className="bg-gray-700/40 p-4 rounded-lg flex justify-between items-center hover:bg-gray-700/60 transition-colors cursor-pointer"
                onClick={() => router.push(`/collab/room/${room.id}`)}
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate">{room.name || '無題のルーム'}</p>
                  <p className="text-sm text-gray-400 truncate">{room.description || '説明がありません'}</p>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 flex-shrink-0 ml-4">
                  <Users className="h-4 w-4" />
                  <span>{room.members?.length || 0}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 col-span-full">現在、公開中のルームはありません。</p>
          )}
        </div>
      </div>
    </main>
  );
}
