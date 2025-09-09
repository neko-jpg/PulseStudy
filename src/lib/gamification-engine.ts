import { PulseConfig, getPulseConfig } from "./config";
import { PulseEngineOutput } from "./pulse-engine";

export class GamificationEngine {
  private config: PulseConfig;
  public totalPoints: number = 0;
  private isPaused: boolean = false;

  // More complex state like streaks would be managed here in a full implementation
  // For MVP, we just focus on point accumulation.

  constructor() {
    this.config = getPulseConfig();
    this.setupVisibilityListener();
  }

  /**
   * Updates the points based on the latest pulse score.
   * @param engineOutput The latest output from the PulseEngine.
   * @param dt Delta time in seconds since the last frame.
   */
  public update(engineOutput: PulseEngineOutput, dt: number): void {
    if (this.isPaused) {
      return;
    }

    const { smoothedScore } = engineOutput;
    const { deep_focus_entry } = this.config.intervention_policy.score_thresholds;
    const { deep_focus } = this.config.gamification.points_per_minute;

    if (smoothedScore >= deep_focus_entry) {
      // Calculate points to add for this frame
      const pointsPerSecond = deep_focus / 60;
      this.totalPoints += pointsPerSecond * dt;
    }
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  private setupVisibilityListener(): void {
    if (typeof document === 'undefined') return;

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  /**
   * Resets the points total.
   */
  public reset(): void {
    this.totalPoints = 0;
  }
}
