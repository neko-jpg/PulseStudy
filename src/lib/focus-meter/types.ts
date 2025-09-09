export type FocusState = 'active' | 'paused' | 'no-signal' | 'warming_up' | 'calibrating';
export type FocusQuality = 'high' | 'mid' | 'low';

export interface FocusOutput {
  raw: number;          // 0..1
  value: number;        // stabilized 0..1
  state: FocusState;
  quality: FocusQuality;
  features: { gazeDev: number; headPitch: number; headYaw: number; browDown: number };
  events: Array<{ kind: 'distraction'|'fatigue'|'confusion'; t: number }>;
}

export interface FocusConfig {
  weights: { gaze: number; posture: number; expression: number };
  smoothing: { halfLifeSec: number; medianWindow: 3|5 };
  slewRate: { upPerSec: number; downPerSec: number };
  hysteresis: { on: number; off: number };
  reading: { pitchDeg: number; weight: number };
  quality: { minConfidence: number; decayPerSec: number };
  freq: { detectHz: number; uiHz: number };
}
