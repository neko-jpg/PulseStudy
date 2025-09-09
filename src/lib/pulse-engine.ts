import { getPulseConfig, PulseConfig } from "./config";

// The FaceLandmarkerResult type is not properly exported in the project's custom declaration.
// We will rely on the implicit 'any' type for the result object.
// import { FaceLandmarkerResult } from "@mediapipe/tasks-vision";

// --- Interfaces and Types ---

interface BlendshapeCategory {
  categoryName: string;
  score: number;
}

export interface HeuristicFeatures {
  gazeDeviation: number; // 0 (on-screen) to 1 (off-screen)
  headPitch: number; // degrees, negative is down
  headYaw: number; // degrees
  headRoll: number; // degrees
  browDown: number; // 0 to 1
}

export interface PulseEvent {
  type: "DISTRACTION" | "CONFUSION" | "FATIGUE";
  timestamp: number;
}

export interface PulseEngineOutput {
  rawScore: number;
  smoothedScore: number;
  features: HeuristicFeatures;
  events: PulseEvent[];
}

interface TriggerState {
  timer: number;
  isActive: boolean;
}

// --- PulseEngine Implementation ---

export class PulseEngine {
  private config: PulseConfig;
  private lastTimestamp: number = -1;

  // State for trigger timers
  private distractionState: TriggerState = { timer: 0, isActive: false };
  private confusionState: TriggerState = { timer: 0, isActive: false };
  private fatigueState: TriggerState = { timer: 0, isActive: false };

  // EWMA smoothing
  private smoothedScore: number = 0.7; // Start with a neutral score
  private smoothingFactor: number = 0.1; // Alpha for EWMA

  constructor() {
    this.config = getPulseConfig();
  }

  public processFrame(result: any, timestamp: number): PulseEngineOutput {
    const events: PulseEvent[] = [];
    if (!result || !result.faceLandmarks || result.faceLandmarks.length === 0) {
      // No face detected, score should plummet
      const rawScore = 0;
      this.smoothedScore = this.calculateSmoothedScore(rawScore);
      return {
        rawScore,
        smoothedScore: this.smoothedScore,
        features: this.getEmptyFeatures(),
        events,
      };
    }

    const deltaTime = this.lastTimestamp > 0 ? (timestamp - this.lastTimestamp) / 1000 : 1/30;
    this.lastTimestamp = timestamp;

    const features = this.extractFeatures(result);
    const rawScore = this.calculateRawScore(features);
    this.smoothedScore = this.calculateSmoothedScore(rawScore);

    // Update trigger states and generate events
    this.updateTriggerState(this.distractionState, features.gazeDeviation > this.config.heuristic_model_params.triggers.distraction.gaze_off_screen_threshold, deltaTime, this.config.heuristic_model_params.triggers.distraction.duration_sec, "DISTRACTION", events);
    this.updateTriggerState(this.confusionState, features.browDown > this.config.heuristic_model_params.triggers.confusion.brow_down_threshold, deltaTime, this.config.heuristic_model_params.triggers.confusion.duration_sec, "CONFUSION", events);
    this.updateTriggerState(this.fatigueState, features.headPitch < this.config.heuristic_model_params.triggers.fatigue.head_pitch_down_threshold_deg, deltaTime, this.config.heuristic_model_params.triggers.fatigue.duration_sec, "FATIGUE", events);

    return {
      rawScore,
      smoothedScore: this.smoothedScore,
      features,
      events,
    };
  }

  private calculateSmoothedScore(rawScore: number): number {
    return this.smoothingFactor * rawScore + (1 - this.smoothingFactor) * this.smoothedScore;
  }

  private updateTriggerState(state: TriggerState, condition: boolean, dt: number, duration: number, eventType: PulseEvent['type'], events: PulseEvent[]) {
    if (condition) {
      state.timer += dt;
    } else {
      state.timer = Math.max(0, state.timer - dt); // Decay timer
    }

    if (state.timer > duration && !state.isActive) {
      state.isActive = true;
      events.push({ type: eventType, timestamp: Date.now() });
    } else if (state.timer <= 0) {
      state.isActive = false;
    }
  }

  private calculateRawScore(features: HeuristicFeatures): number {
    const weights = this.config.heuristic_model_params.scoring_weights;

    // Penalties - start from 1.0 and subtract penalties
    let score = 1.0;
    score -= features.gazeDeviation * weights.gaze;
    score -= (features.browDown * weights.blendshapes);

    // Head pose penalty is based on how far it is from "upright"
    const pitchPenalty = Math.abs(features.headPitch) > 10 ? (Math.abs(features.headPitch) - 10) / 20 : 0; // Penalize after 10 deg
    score -= Math.min(pitchPenalty, 1.0) * weights.head_pose;

    return Math.max(0, score); // Ensure score is not negative
  }

  private extractFeatures(result: any): HeuristicFeatures {
    const faceLandmarks = result.faceLandmarks[0];
    const blendshapes: BlendshapeCategory[] = result.faceBlendshapes[0]?.categories || [];
    const matrix = result.facialTransformationMatrixes[0]?.data || [];

    const browDown = blendshapes.find(c => c.categoryName === 'browDownLeft' || c.categoryName === 'browDownRight')?.score ?? 0;

    // A simple gaze deviation heuristic: are the iris landmarks detected?
    // 468: left iris, 473: right iris
    const leftIris = faceLandmarks[473];
    const rightIris = faceLandmarks[468];
    // This is a very basic heuristic. If landmarks are not detected, it implies off-screen gaze.
    const gazeDeviation = (leftIris && rightIris && leftIris.visibility > 0.8 && rightIris.visibility > 0.8) ? 0 : 1;

    const { pitch, yaw, roll } = this.getEulerAnglesFromMatrix(matrix);

    return {
      gazeDeviation,
      headPitch: pitch,
      headYaw: yaw,
      headRoll: roll,
      browDown,
    };
  }

  private getEulerAnglesFromMatrix(matrix: number[]): { pitch: number, yaw: number, roll: number } {
    if (matrix.length !== 16) return { pitch: 0, yaw: 0, roll: 0 };

    const sy = Math.sqrt(matrix[0] * matrix[0] +  matrix[4] * matrix[4]);
    const singular = sy < 1e-6;

    let x, y, z;
    if (!singular) {
        x = Math.atan2(matrix[9] , matrix[10]);
        y = Math.atan2(-matrix[8], sy);
        z = Math.atan2(matrix[4], matrix[0]);
    } else {
        x = Math.atan2(-matrix[6], matrix[5]);
        y = Math.atan2(-matrix[8], sy);
        z = 0;
    }

    // Convert radians to degrees
    return {
      pitch: x * (180 / Math.PI),
      yaw:   y * (180 / Math.PI),
      roll:  z * (180 / Math.PI)
    };
  }

  private getEmptyFeatures(): HeuristicFeatures {
      return { gazeDeviation: 1, headPitch: 0, headYaw: 0, headRoll: 0, browDown: 0 };
  }
}
