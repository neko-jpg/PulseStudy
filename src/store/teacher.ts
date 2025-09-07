import { create } from 'zustand'

export type ClassItem = { id: string; name: string }
export type ClassSummary = { mins: number; acc: number; flow: number }
export type Assignment = { id: string; title: string; status: 'draft' | 'published'; dueAt?: string }
export type StudentRow = { id: string; name: string; mins: number; acc: number; flow: number; progress: number }

type State = {
  classId?: string
  classes: ClassItem[]
  summary?: ClassSummary
  assignments: Assignment[]
  students: StudentRow[]
  wizardOpen: boolean
  studentPanel?: { id: string } | null
}

type Actions = {
  setClassId: (id: string) => void
  setClasses: (items: ClassItem[]) => void
  setSummary: (s: ClassSummary) => void
  setAssignments: (a: Assignment[]) => void
  addAssignment: (a: Assignment) => void
  publishAssignment: (id: string) => void
  setStudents: (s: StudentRow[]) => void
  openWizard: () => void
  closeWizard: () => void
  openStudent: (id: string) => void
  closeStudent: () => void
}

export const useTeacherStore = create<State & Actions>((set) => ({
  classes: [],
  assignments: [],
  students: [],
  wizardOpen: false,
  setClassId: (id) => set({ classId: id }),
  setClasses: (items) => set({ classes: items }),
  setSummary: (s) => set({ summary: s }),
  setAssignments: (a) => set({ assignments: a }),
  addAssignment: (a) => set((s) => ({ assignments: [a, ...s.assignments] })),
  publishAssignment: (id) => set((s) => ({ assignments: s.assignments.map(x => x.id === id ? { ...x, status: 'published' } : x) })),
  setStudents: (sItems) => set({ students: sItems }),
  openWizard: () => set({ wizardOpen: true }),
  closeWizard: () => set({ wizardOpen: false }),
  openStudent: (id) => set({ studentPanel: { id } }),
  closeStudent: () => set({ studentPanel: null }),
}))

