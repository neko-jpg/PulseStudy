import { create } from 'zustand';

export type LearningMode = 'normal' | 'focus';

type LearnSettingsState = {
  learningMode: LearningMode;
  setLearningMode: (mode: LearningMode) => void;
};

export const useLearnSettingsStore = create<LearnSettingsState>((set) => ({
  learningMode: 'normal',
  setLearningMode: (mode) => set({ learningMode: mode }),
}));
