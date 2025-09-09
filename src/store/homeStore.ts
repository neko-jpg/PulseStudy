import { create } from 'zustand'

export type ModuleSummary = {
  id: string
  moduleId: string
  subject: string
  title: string
  estMins: number
  questions: number
}

export type CameraPermission = 'idle' | 'pending' | 'granted' | 'denied'

type HomeState = {
  currentModuleId: string | null
  setCurrentModuleId: (id: string) => void
  unread: number
  setUnread: (n: number) => void
  streakDays: number
  setStreakDays: (n: number) => void
  pulse: number
  setPulse: (n: number) => void
  isPulseEngineEnabled: boolean
  setPulseEngineEnabled: (enabled: boolean) => void
  cameraPermission: CameraPermission
  setCameraPermission: (status: CameraPermission) => void
}

export const useHomeStore = create<HomeState>((set) => ({
  currentModuleId: null,
  setCurrentModuleId: (id) => set({ currentModuleId: id }),
  unread: 0,
  setUnread: (n) => set({ unread: n }),
  streakDays: 0,
  setStreakDays: (n) => set({ streakDays: n }),
  pulse: 0,
  setPulse: (n) => set({ pulse: n }),
  isPulseEngineEnabled: false,
  setPulseEngineEnabled: (enabled) => set({ isPulseEngineEnabled: enabled }),
  cameraPermission: 'idle',
  setCameraPermission: (status) => set({ cameraPermission: status }),
}))

