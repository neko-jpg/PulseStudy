import { create } from 'zustand'
import type { LearnState, Step, Mistake } from '@/lib/types'

type Actions = {
  init: (moduleId: string, initialStep?: Step) => void
  nextStep: (totalItems: number) => void
  select: (i: number) => void
  setSubmitting: (b: boolean) => void
  toggleExplain: () => void
  setStep: (s: Step) => void
  reset: () => void
  markResult: (isCorrect: boolean, mistake?: Mistake) => void
  setElapsedTime: (time: number) => void
}

const initialState: LearnState = {
  moduleId: 'quad-basic',
  step: 'explain',
  idx: 0,
  selected: undefined,
  submitting: false,
  showExplain: false,
  correct: 0,
  total: 0,
  elapsedTime: 0,
  mistakes: [],
}

export const useLearnStore = create<LearnState & Actions>((set) => ({
  ...initialState,

  init: (moduleId, initialStep = 'explain') => set({
    ...initialState,
    moduleId,
    step: initialStep,
  }),
  nextStep: (totalItems) =>
    set((s) => {
      if (s.step === 'explain') return { step: 'quiz', selected: undefined, showExplain: false }
      if (s.step === 'quiz') return { step: 'result' }
      // result → 次の問題 or 完了
      const nextIdx = s.idx + 1
      if (nextIdx >= totalItems) {
        return { step: 'result' } // ページ側で完了ダイアログへ
      }
      return { step: 'quiz', idx: nextIdx, selected: undefined, showExplain: false }
    }),
  select: (i) => set({ selected: i }),
  setSubmitting: (b) => set({ submitting: b }),
  toggleExplain: () => set((s) => ({ showExplain: !s.showExplain })),
  setStep: (st) => set({ step: st }),
  reset: () => set(initialState),
  markResult: (isCorrect, mistake) => set((s) => ({
    correct: s.correct + (isCorrect ? 1 : 0),
    total: s.total + 1,
    mistakes: !isCorrect && mistake ? [...s.mistakes, mistake] : s.mistakes,
  })),
  setElapsedTime: (time) => set({ elapsedTime: time }),
}))

