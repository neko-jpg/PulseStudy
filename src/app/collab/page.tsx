'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, PlusCircle, LogIn, Network, CheckCircle, XCircle } from 'lucide-react';
import { testDirectICE } from '@/lib/rtc';
import { cn } from '@/lib/utils';

export default function CollabLobbyPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // State for pre-flight check
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const handleCreateRoom = async () => { /* ... as before ... */
    setIsCreating(true);
    try {
      const res = await fetch('/api/rooms', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create room');
      const { roomId: newRoomId } = await res.json();
      router.push(`/collab/${newRoomId}`);
    } catch (error) {
      console.error("Failed to create room:", error);
      setIsCreating(false);
    }
  };

  const handleJoinRoom = () => { /* ... as before ... */
    if (!roomId.trim()) return;
    router.push(`/collab/${roomId.trim()}`);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testDirectICE();
    setTestResult(result);
    setIsTesting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">コラボ学習</h1>
          <p className="text-muted-foreground">友達と一緒にリアルタイムで学ぼう</p>
        </div>

        {/* Pre-flight Check Card */}
        <Card>
          <CardHeader>
            <CardTitle>接続テスト</CardTitle>
            <CardDescription>コラボ学習を始める前に、ネットワーク接続が安定しているか確認します。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTestConnection} disabled={isTesting} className="w-full">
              {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Network className="mr-2 h-4 w-4" />}
              テストを実行
            </Button>
            {testResult !== null && (
              <div className={cn("mt-4 text-center text-sm p-2 rounded-md", testResult ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800")}>
                {testResult ? (
                  <p className="flex items-center justify-center"><CheckCircle className="mr-2 h-4 w-4" />直接接続の可能性が高いです。快適に利用できます。</p>
                ) : (
                  <p className="flex items-center justify-center"><XCircle className="mr-2 h-4 w-4" />直接接続が難しいようです。別のネットワーク（Wi-Fiやテザリング）を試してください。</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>新しいルームを作成</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateRoom} disabled={isCreating} className="w-full">
              {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              {isCreating ? '作成中...' : '作成する'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>既存のルームに参加</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="ルームID" onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()} />
            <Button onClick={handleJoinRoom} disabled={!roomId.trim()} className="w-full">
              <LogIn className="mr-2 h-4 w-4" />
              参加する
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
