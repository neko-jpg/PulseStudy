import { create } from 'zustand'

type Role = 'solver' | 'viewer'

type CollabState = {
  role: Role
  solverId?: string
  pendingControlRequests: string[]
}

type Actions = {
  setRole: (r: Role) => void
  setSolver: (id?: string) => void
  requestControl: (userId: string) => void
  approveControl: (userId: string) => void
}

export const useCollabStore = create<CollabState & Actions>((set) => ({
  role: 'viewer',
  solverId: undefined,
  pendingControlRequests: [],

  setRole: (r) => set({ role: r }),
  setSolver: (id) => set({ solverId: id }),
  requestControl: (userId) => set((s) => ({ pendingControlRequests: Array.from(new Set([...s.pendingControlRequests, userId])) })),
  approveControl: (userId) => set((s) => ({ solverId: userId, pendingControlRequests: s.pendingControlRequests.filter((x) => x !== userId) })),
}))

