import type { FocusConfig } from './focus-meter/types';

export const defaultConfig: FocusConfig = {
  weights: { gaze: 0.55, posture: 0.30, expression: 0.15 },
  smoothing: { halfLifeSec: 1.6, medianWindow: 3 },
  slewRate: { upPerSec: 0.35, downPerSec: 0.25 },
  hysteresis: { on: 0.62, off: 0.45 },
  reading: { pitchDeg: -25, weight: 0.5 },
  quality: { minConfidence: 0.5, decayPerSec: 0.10 },
  freq: { detectHz: 12, uiHz: 1 },
};
