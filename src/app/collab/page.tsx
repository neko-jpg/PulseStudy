import { Suspense } from 'react';
import { CollabLobby } from '@/components/collab-lobby/CollabLobby';

export default function CollabLobbyPage() {
  return (
    <Suspense fallback={<div className="p-6">読み込み中…</div>}>
      <CollabLobby />
    </Suspense>
  );
}

