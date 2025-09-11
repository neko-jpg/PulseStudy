import { create } from 'zustand'

export type UserRole = 'student' | 'teacher'

type AuthState = {
  role: UserRole
  setRole: (r: UserRole) => void
  name: string
  setName: (n: string) => void
  user: { uid: string } | null
  setUser: (u: { uid: string } | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  role: 'student',
  setRole: (r) => set({ role: r }),
  name: '葵',
  setName: (n) => set({ name: n }),
  user: null,
  setUser: (u) => set({ user: u }),
}))

