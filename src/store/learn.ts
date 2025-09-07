import { create } from 'zustand'
import type { LearnState, Step } from '@/lib/types'

type Actions = {
  init: (moduleId: string) => void
  nextStep: (totalItems: number) => void
  select: (i: number) => void
  setSubmitting: (b: boolean) => void
  toggleExplain: () => void
  setStep: (s: Step) => void
  reset: () => void
  markResult: (correctInc: number) => void
}

export const useLearnStore = create<LearnState & Actions>((set) => ({
  moduleId: 'quad-basic',
  step: 'explain',
  idx: 0,
  selected: undefined,
  submitting: false,
  showExplain: false,
  correct: 0,
  total: 0,

  init: (moduleId) => set({ moduleId, step: 'explain', idx: 0, selected: undefined, submitting: false, showExplain: false, correct: 0, total: 0 }),
  nextStep: (totalItems) =>
    set((s) => {
      if (s.step === 'explain') return { step: 'quiz', selected: undefined, showExplain: false }
      if (s.step === 'quiz') return { step: 'result' }
      // result → 次の問題 or 完了
      const nextIdx = s.idx + 1
      if (nextIdx >= totalItems) {
        return { step: 'result' } // ページ側で完了ダイアログへ
      }
      return { step: 'explain', idx: nextIdx, selected: undefined, showExplain: false }
    }),
  select: (i) => set({ selected: i }),
  setSubmitting: (b) => set({ submitting: b }),
  toggleExplain: () => set((s) => ({ showExplain: !s.showExplain })),
  setStep: (st) => set({ step: st }),
  reset: () => set({ step: 'explain', idx: 0, selected: undefined, submitting: false, showExplain: false, correct: 0, total: 0 }),
  markResult: (c) => set((s) => ({ correct: s.correct + c, total: s.total + 1 })),
}))

