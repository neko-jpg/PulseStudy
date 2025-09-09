import config from './pulse-config.json';

// --- Type Definitions for strong typing ---

interface ScoringWeights {
  gaze: number;
  head_pose: number;
  blendshapes: number;
}

interface TriggerCondition {
  duration_sec: number;
  [key: string]: number; // For thresholds like gaze_off_screen_threshold
}

interface HeuristicTriggers {
  distraction: TriggerCondition;
  confusion: TriggerCondition;
  fatigue: TriggerCondition;
}

interface HeuristicModelParams {
  scoring_weights: ScoringWeights;
  triggers: HeuristicTriggers;
}

interface InterventionPolicy {
  cooldown_sec: {
    [key: string]: number;
  };
  score_thresholds: {
    low_focus_entry: number;
    deep_focus_entry: number;
  };
}

interface GamificationConfig {
    points_per_minute: {
        [key: string]: number;
    };
    streak_bonus: {
        daily_multiplier: number;
        max_multiplier: number;
    }
}

export interface PulseConfig {
  version: string;
  description: string;
  heuristic_model_params: HeuristicModelParams;
  intervention_policy: InterventionPolicy;
  gamification: GamificationConfig;
}


// --- Service Implementation ---

// In a real application, this might fetch from a server, have caching, etc.
// For the MVP, we simply import the local JSON file.
const pulseConfig: PulseConfig = config;

/**
 * Retrieves the application's remote configuration for the Pulse feature.
 * For the MVP, this reads from a local JSON file. In the future, this
 * could be replaced with a fetch from a service like Firebase Remote Config.
 * @returns {PulseConfig} The strongly-typed configuration object.
 */
export const getPulseConfig = (): PulseConfig => {
  // We could add validation logic here in the future (e.g., using Zod).
  return pulseConfig;
};

// Example of accessing a specific value
export const getDistractionNudgeCooldown = (): number => {
    return getPulseConfig().intervention_policy.cooldown_sec.distraction_nudge ?? 90;
}
