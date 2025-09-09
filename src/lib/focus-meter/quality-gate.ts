/**
 * Statistics about the current video frame used for quality evaluation.
 */
export interface FrameStats {
  brightness: number;
  faceAreaRatio: number;
  blurVar: number;
  landmarkConf: number;
}

export interface QualityThresholds {
  light: [number, number];
  faceAreaMin: number;
  blurVarMin: number;
  confMin: number;
}

/**
 * Computes a quality weight (0.5..1) based on frame statistics and thresholds.
 * The weight is meant to avoid overly penalizing low quality frames.
 *
 * @param stats Frame statistics.
 * @param thresholds Quality thresholds configuration.
 * @returns Quality weight between 0.5 and 1.0.
 */
export function computeQualityWeight(stats: FrameStats, thresholds: QualityThresholds): number {
  let w = 1;
  if (stats.brightness < thresholds.light[0] || stats.brightness > thresholds.light[1]) {
    w *= 0.9;
  }
  if (stats.faceAreaRatio < thresholds.faceAreaMin) {
    w *= 0.85;
  }
  if (stats.blurVar < thresholds.blurVarMin) {
    w *= 0.9;
  }
  if (stats.landmarkConf < thresholds.confMin) {
    w *= 0.8;
  }
  return Math.min(1, Math.max(0.5, w));
}

/**
 * Generates sample outputs for inspection.
 */
export function _testQualityWeight() {
  const thresholds: QualityThresholds = {
    light: [50, 200],
    faceAreaMin: 0.1,
    blurVarMin: 50,
    confMin: 0.5,
  };
  const samples: FrameStats[] = Array.from({ length: 10 }, (_, i) => ({
    brightness: 40 + i * 20,
    faceAreaRatio: 0.05 + i * 0.02,
    blurVar: 40 + i * 10,
    landmarkConf: 0.4 + i * 0.05,
  }));
  const weights = samples.map((s) => computeQualityWeight(s, thresholds));
  console.log(weights);
}
