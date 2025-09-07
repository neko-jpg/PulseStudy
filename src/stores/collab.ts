import { create } from 'zustand';

// ルーム参加者の型定義
interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
}

// スタンプの型定義
type StampType = '👍' | '❓' | '💡';
interface Stamp {
  id: string;
  type: StampType;
  from: string; // Member ID
}

interface CollabState {
  roomId: string | null;
  members: Member[];
  role: 'host' | 'participant';
  stamps: Stamp[];
  setRoomId: (id: string | null) => void;
  setMembers: (members: Member[]) => void;
  addStamp: (stamp: Stamp) => void;
}

export const useCollabStore = create<CollabState>((set) => ({
  roomId: null,
  members: [],
  role: 'participant',
  stamps: [],
  setRoomId: (id) => set({ roomId: id }),
  setMembers: (members) => set({ members }),
  addStamp: (stamp) => set((state) => ({ stamps: [...state.stamps, stamp] })),
}));
