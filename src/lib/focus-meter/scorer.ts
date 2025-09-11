import type { FocusFeatures } from './feature-extractor';
import type { FocusConfig } from './types';

/**
 * Normalizes a deviation value to a 0-1 range.
 * A deviation of 0 results in a score of 1.
 * A deviation of `max` or more results in a score of 0.
 * @param value The deviation value.
 * @param max The maximum allowed deviation before the score becomes 0.
 * @returns A normalized score from 0 to 1.
 */
function normalizeDeviation(value: number, max: number): number {
  return Math.max(0, 1 - Math.abs(value) / max);
}

/**
 * Calculates a raw focus score based on extracted features and configuration weights.
 * @param features The features extracted from MediaPipe.
 * @param config The focus measurement configuration.
 * @returns A raw focus score between 0 and 1.
 */
export function calculateScore(features: FocusFeatures, config: FocusConfig): number {
  // 1. Calculate posture score (based on head pitch and yaw)
  // We define some reasonable max deviation angles in radians (e.g., 30 degrees for yaw, 25 for pitch)
  const MAX_YAW_RAD = 30 * (Math.PI / 180);
  const MAX_PITCH_RAD = 25 * (Math.PI / 180);
  const yawScore = normalizeDeviation(features.headYaw, MAX_YAW_RAD);
  let pitchScore = normalizeDeviation(features.headPitch, MAX_PITCH_RAD);

  // Apply reading posture allowance if head is tilted down
  const readingPitchRad = config.reading.pitchDeg * (Math.PI / 180);
  if (features.headPitch < readingPitchRad) {
    // Gaze stability check should be added here in the future.
    const penalty = 1 - pitchScore;
    const reducedPenalty = penalty * config.reading.weight;
    pitchScore = 1 - reducedPenalty;
  }

  // A simple average for the posture component.
  const postureScore = (yawScore + pitchScore) / 2;

  // 2. Calculate expression score (based on brow down)
  // We assume browDown is 0-1, where 1 is max furrowing.
  // Per product spec: furrowing indicates concentration, so higher browDown should increase score.
  const expressionScore = features.browDown;

  // 3. Calculate gaze score (currently a placeholder)
  // We assume gazeDev will be 0-1, where 1 is max deviation from center.
  const gazeScore = 1 - features.gazeDev;

  // 4. Combine scores with weights from the config
  const rawScore =
    gazeScore * config.weights.gaze +
    postureScore * config.weights.posture +
    expressionScore * config.weights.expression;

  // 5. Ensure the final score is clamped between 0 and 1
  return Math.max(0, Math.min(1, rawScore));
}
