import type { FocusOutput } from "./focus-meter/types";

const GAMIFICATION_CONFIG = {
  score_thresholds: {
    deep_focus_entry: 0.75,
  },
  points_per_minute: {
    deep_focus: 10,
  }
};

export class GamificationEngine {
  public totalPoints: number = 0;
  private isPaused: boolean = false;

  // More complex state like streaks would be managed here in a full implementation
  // For MVP, we just focus on point accumulation.

  constructor() {
    this.setupVisibilityListener();
  }

  /**
   * Updates the points based on the latest focus score.
   * @param engineOutput The latest output from the FocusMeter.
   * @param dt Delta time in seconds since the last frame.
   */
  public update(engineOutput: FocusOutput, dt: number): void {
    if (this.isPaused) {
      return;
    }

    const { value } = engineOutput;
    const { deep_focus_entry } = GAMIFICATION_CONFIG.score_thresholds;
    const { deep_focus } = GAMIFICATION_CONFIG.points_per_minute;

    if (value >= deep_focus_entry) {
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
