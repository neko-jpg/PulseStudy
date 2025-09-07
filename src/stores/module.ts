import { create } from 'zustand';

// 学習のステップを定義
type Step = 'explain' | 'check' | 'practice';

interface ModuleState {
  currentModuleId: string | null;
  step: Step;
  idx: number; // 各ステップ内の問題番号など
  progress: number; // 0-100%
  streak: number; // 連続正解数
  setModuleId: (id: string | null) => void;
  setStep: (step: Step) => void;
  setIdx: (idx: number) => void;
  setProgress: (progress: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

export const useModuleStore = create<ModuleState>((set) => ({
  currentModuleId: null,
  step: 'explain',
  idx: 0,
  progress: 0,
  streak: 0,
  setModuleId: (id) => set({ currentModuleId: id }),
  setStep: (step) => set({ step }),
  setIdx: (idx) => set({ idx }),
  setProgress: (progress) => set({ progress }),
  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
  resetStreak: () => set({ streak: 0 }),
}));
