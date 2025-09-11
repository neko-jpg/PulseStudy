import { create } from 'zustand'

export type UserRole = 'student' | 'teacher'

type AuthState = {
  role: UserRole
  setRole: (r: UserRole) => void
  name: string
  setName: (n: string) => void
  user: { uid: string } | null
  setUser: (u: { uid: string } | null) => void
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void> | void
}

export const useAuthStore = create<AuthState>((set) => ({
  role: 'student',
  setRole: (r) => set({ role: r }),
  name: '葵',
  setName: (n) => set({ name: n }),
  user: null,
  setUser: (u) => set({ user: u }),
  loading: false,
  error: null,
  signInWithGoogle: () => {
    // Stubbed auth action to satisfy build; replace with real auth later
    set({ loading: true, error: null })
    setTimeout(() => set({ loading: false, user: { uid: 'stub' } }), 10)
  },
}))

