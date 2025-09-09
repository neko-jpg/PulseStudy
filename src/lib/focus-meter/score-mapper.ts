/**
 * Configuration for score mapping.
 */
export interface ScoreMappingConfig {
  enablePercentile: boolean;
  gamma?: number;
  sigmoid?: { k: number; center: number } | null;
  windowSec: number;
}

/**
 * Creates a score mapper function that applies percentile normalization and
 * optional gamma or sigmoid mapping.
 *
 * @param cfg The score mapping configuration.
 * @returns A function mapping raw scores to display scores.
 */
export function createScoreMapper(cfg: ScoreMappingConfig) {
  let p10 = 0.25;
  let p90 = 0.65;
  const k = 0.02; // EMA coefficient for percentile updates

  const ensureRange = () => {
    if (p90 - p10 < 0.1) {
      p90 = p10 + 0.1;
    }
  };

  return (raw: number, _t: number) => {
    if (cfg.enablePercentile) {
      // Update p10 and p90 using simple EMA approximations
      p10 += k * ((raw < p10 ? raw : p10) - p10);
      p90 += k * ((raw > p90 ? raw : p90) - p90);
      ensureRange();
    }

    let x = (raw - p10) / (p90 - p10 + 1e-6);
    x = Math.min(1, Math.max(0, x));

    if (cfg.gamma && cfg.gamma !== 1) {
      x = Math.pow(x, 1 / cfg.gamma);
    }

    if (cfg.sigmoid) {
      const { k: kk, center } = cfg.sigmoid;
      const s = 1 / (1 + Math.exp(-kk * (x - center)));
      const min = 1 / (1 + Math.exp(kk * center));
      const max = 1 / (1 + Math.exp(-kk * (1 - center)));
      x = (s - min) / (max - min + 1e-6);
    }

    return x;
  };
}

/**
 * Simple test demonstrating the score mapper behaviour.
 */
export function _testScoreMapper() {
  const mapper = createScoreMapper({
    enablePercentile: true,
    gamma: 1.6,
    sigmoid: null,
    windowSec: 30,
  });
  const samples = [0.2, 0.3, 0.5, 0.7, 0.9];
  const out = samples.map((v, i) => mapper(v, i * 1000));
  console.log(out);
}
