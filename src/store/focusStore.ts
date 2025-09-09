import { create } from 'zustand';
import type { FocusOutput, FocusState, FocusQuality } from '@/lib/focus-meter/types';

interface FocusStore {
  output: FocusOutput;
  setFocus: (newOutput: Partial<FocusOutput>) => void;
  setValue: (value: number) => void;
  setState: (state: FocusState) => void;
  setQuality: (quality: FocusQuality) => void;
}

const initialOutput: FocusOutput = {
    raw: 0,
    value: 0,
    state: 'paused',
    quality: 'low',
    features: { gazeDev: 0, headPitch: 0, headYaw: 0, browDown: 0 },
    events: [],
};

export const useFocusStore = create<FocusStore>((set) => ({
  output: initialOutput,
  setFocus: (newOutput) => set((state) => ({ output: { ...state.output, ...newOutput } })),
  setValue: (value) => set((state) => ({ output: { ...state.output, value }})),
  setState: (st) => set((state) => ({ output: { ...state.output, state: st }})),
  setQuality: (q) => set((state) => ({ output: { ...state.output, quality: q }})),
}));
