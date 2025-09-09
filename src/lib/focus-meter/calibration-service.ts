/**
 * Parameters derived from calibration phases.
 */
export interface CalibrationParams {
  muBase: number;
  muFocus: number;
}

/**
 * Service for handling baseline and focus calibration.
 * Samples are collected via addSample() while a phase is active.
 */
export class CalibrationService {
  private base: number[] = [];
  private focus: number[] = [];
  private phase: 'idle' | 'baseline' | 'focus' = 'idle';

  constructor(private decayMinutes = 0) {}

  startBaseline() {
    this.phase = 'baseline';
    this.base = [];
  }

  startFocus() {
    this.phase = 'focus';
    this.focus = [];
  }

  isRunning() {
    return this.phase !== 'idle';
  }

  addSample(v: number) {
    if (this.phase === 'baseline') {
      this.base.push(v);
    } else if (this.phase === 'focus') {
      this.focus.push(v);
    }
  }

  getParams(): CalibrationParams {
    const avg = (arr: number[]) => (arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length));
    return { muBase: avg(this.base), muFocus: avg(this.focus) };
  }

  normalize(raw: number, params: CalibrationParams): number {
    return Math.min(1, Math.max(0, (raw - params.muBase) / (params.muFocus - params.muBase + 1e-6)));
  }
}

/**
 * Simple test for the calibration service using mocked samples.
 */
export function _testCalibrationService() {
  const svc = new CalibrationService();
  svc.startBaseline();
  for (let i = 0; i < 10; i++) svc.addSample(0.2 + i * 0.01);
  svc.startFocus();
  for (let i = 0; i < 10; i++) svc.addSample(0.8 + i * 0.01);
  const params = svc.getParams();
  const norm = svc.normalize(0.5, params);
  console.log(params, norm);
}
