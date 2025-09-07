import { create } from 'zustand';

type Role = 'student' | 'teacher';
type Mode = 'standard' | 'self' | 'extended';

interface User {
  id: string;
  name: string;
  // 今後拡張される可能性のあるユーザー情報
}

interface AuthState {
  user: User | null;
  role: Role;
  consent: boolean;
  mode: Mode;
  setRole: (role: Role) => void;
  setMode: (mode: Mode) => void;
  setConsent: (consent: boolean) => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, // 初期状態ではユーザー情報はなし
  role: 'student', // デフォルトの役割
  consent: false, // デフォルトの同意状態
  mode: 'standard', // デフォルトのプライバシーモード
  setRole: (role) => set({ role }),
  setMode: (mode) => set({ mode }),
  setConsent: (consent) => set({ consent }),
  setUser: (user) => set({ user }),
}));
