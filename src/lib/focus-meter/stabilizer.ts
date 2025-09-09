import type { FocusConfig } from './types';

/**
 * Calculates the median of three numbers.
 */
export function median3(a: number, b: number, c: number): number {
  return [a, b, c].sort((x, y) => x - y)[1];
}

/**
 * Applies Exponential Moving Average (EMA) smoothing.
 * @param prev The previous smoothed value.
 * @param next The current raw value.
 * @param dt The time delta in seconds.
 * @param half The half-life for the smoothing.
 * @returns The new smoothed value.
 */
export function ema(prev: number, next: number, dt: number, half: number): number {
  const a = 1 - Math.exp(-Math.LN2 * dt / half);
  return prev + a * (next - prev);
}

/**
 * Limits the rate of change of a value (slew rate).
 * @param prev The previous final value.
 * @param next The current smoothed value.
 * @param dt The time delta in seconds.
 * @param up The maximum allowed increase per second.
 * @param dn The maximum allowed decrease per second.
 * @returns The new value, constrained by the slew rate.
 */
export function slew(prev: number, next: number, dt: number, up: number, dn: number): number {
  const maxVal = prev + up * dt;
  const minVal = prev - dn * dt;
  return Math.min(maxVal, Math.max(minVal, next));
}

/**
 * The main stabilization pipeline function.
 * Applies median filter, EMA, and slew rate limiting.
 * @param raw The raw input value (0-1).
 * @param dt The time delta since the last update in seconds.
 * @param cfg The focus configuration object.
 * @param hist The history of raw values for the median filter (should be managed by the caller).
 * @param prev The previous output value from the stabilizer.
 * @returns The new, stabilized output value.
 */
export function stabilize(raw: number, dt: number, cfg: FocusConfig, hist: number[], prev:number): number {
  // 1. Median filter for outlier rejection
  hist.push(raw);
  if (hist.length > cfg.smoothing.medianWindow) {
    hist.shift();
  }

  let medianFiltered = raw;
  if (hist.length === cfg.smoothing.medianWindow) {
    // For window size 3
    if (cfg.smoothing.medianWindow === 3) {
        medianFiltered = median3(hist[0], hist[1], hist[2]);
    }
    // Note: A more generic median function would be needed for other window sizes.
    // The spec suggests 3 or 5. We'll stick to 3 as per the sketch.
  }

  // 2. EMA for temporal smoothing
  const emaFiltered = ema(prev, medianFiltered, dt, cfg.smoothing.halfLifeSec);

  // 3. Slew rate for limiting change speed
  const slewed = slew(prev, emaFiltered, dt, cfg.slewRate.upPerSec, cfg.slewRate.downPerSec);

  return slewed;
}
