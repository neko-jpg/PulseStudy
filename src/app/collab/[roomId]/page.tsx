'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Send, Loader2, Mic, StopCircle, Phone, PhoneOff, Rss, Download } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { createPeerConnection } from '@/lib/rtc';
import { cn } from '@/lib/utils';

// --- MAIN COLLAB ROOM PAGE ---
export default function CollabRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  const { toast } = useToast();

  // --- STATE ---
  // ... (Chat state omitted for brevity)
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUser = { id: 'u1', name: '葵' };

  // WebRTC & Recording
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('disconnected');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);

  // --- SIGNALING & WEBRTC (logic omitted for brevity) ---
  const sendSignal = useCallback(async (type: string, payload: any) => { /* ... */ }, [roomId]);
  const setupPeerConnection = useCallback(() => { /* ... */ }, [sendSignal]);
  const startCall = async () => { /* ... */ };
  const createOffer = async () => { /* ... */ };
  const handleAnswer = async () => { /* ... */ };
  const hangUp = () => { /* ... */ };
  useEffect(() => { setupPeerConnection(); return () => hangUp(); }, []);

  // --- MIX & RECORD LOGIC ---
  const handleStartRecording = () => {
    if (!localStreamRef.current || !remoteStream) {
      toast({ variant: "destructive", title: "録音不可", description: "通話が接続されていません。" });
      return;
    }

    // 1. Mix streams
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();
    const localSource = audioContext.createMediaStreamSource(localStreamRef.current);
    localSource.connect(destination);
    const remoteSource = audioContext.createMediaStreamSource(remoteStream);
    remoteSource.connect(destination);

    // 2. Setup MediaRecorder with the mixed stream
    const mixedStream = destination.stream;
    mediaRecorderRef.current = new MediaRecorder(mixedStream, { mimeType: 'audio/webm' });
    const chunks: Blob[] = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(audioBlob);
      setRecordedBlobUrl(url);
      // Optional: upload to server
      // const formData = new FormData();
      // formData.append('file', audioBlob, `mixed-recording.webm`);
      // fetch('/api/upload', { method: 'POST', body: formData });
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    setRecordedBlobUrl(null);
    toast({ title: "会話の録音を開始しました" });
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    toast({ title: "録音を停止しました" });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center p-2 border-b bg-background z-20 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => router.push('/collab')}><ArrowLeft /></Button>
        <h1 className="ml-2 font-bold text-md sm:text-lg truncate">コラボ・ルーム: {roomId}</h1>
      </header>
      <div className="flex-1 grid md:grid-cols-3 overflow-hidden">
        <main className="md:col-span-2 p-4 overflow-y-auto space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Rss/>P2P 音声通話</CardTitle></CardHeader>
            <CardContent>
              {/* ... P2P Call UI, omitted for brevity ... */}
              <p className="text-sm text-muted-foreground">接続状態: {connectionState}</p>
              {remoteStream && <audio ref={el => { if (el) el.srcObject = remoteStream; }} autoPlay playsInline />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">会話の録音</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-4">
              {!isRecording ? (
                <Button onClick={handleStartRecording} disabled={connectionState !== 'connected'}>
                  <Mic className="mr-2 h-4 w-4" />録音開始
                </Button>
              ) : (
                <Button onClick={handleStopRecording} variant="destructive">
                  <StopCircle className="mr-2 h-4 w-4" />録音停止
                </Button>
              )}
              {isRecording && <div className="flex items-center gap-2 text-destructive animate-pulse"><div className="h-3 w-3 rounded-full bg-destructive" />REC</div>}
              {recordedBlobUrl && (
                <Button asChild variant="outline">
                  <a href={recordedBlobUrl} download={`session-${roomId}.webm`}><Download className="mr-2 h-4 w-4" />録音をダウンロード</a>
                </Button>
              )}
            </CardContent>
          </Card>
        </main>
        <aside className="md:col-span-1 border-l flex flex-col bg-background">
          {/* Chat UI ... as before ... */}
        </aside>
      </div>
    </div>
  );
}
