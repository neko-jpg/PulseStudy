import { PulseConfig, getPulseConfig } from "./config";
import { PulseEngineOutput } from "./pulse-engine";
import { telemetryService } from "./telemetry";

export type InterventionAction = {
  type: "SHOW_FOCUS_NUDGE";
  level: number; // e.g., 1 for subtle, 2 for stronger
} | {
  type: "SUGGEST_HELP";
  context: any; // e.g., info about the content being viewed
};

export class InterventionOrchestrator {
  private config: PulseConfig;
  private lastNudgeTimestamp: number = 0;
  private lastHelpTimestamp: number = 0;

  constructor() {
    this.config = getPulseConfig();
  }

  /**
   * Processes the Pulse Engine output and determines if an intervention is warranted.
   * @param engineOutput The latest output from the PulseEngine.
   * @returns An InterventionAction or null if no action is needed.
   */
  public getAction(engineOutput: PulseEngineOutput): InterventionAction | null {
    const { smoothedScore, events, features } = engineOutput;
    const now = Date.now();

    // Check for distraction nudge
    const distractionEvent = events.find(e => e.type === "DISTRACTION");
    if (distractionEvent) {
      const cooldown = this.config.intervention_policy.cooldown_sec.distraction_nudge * 1000;
      if (now - this.lastNudgeTimestamp > cooldown) {
        if (smoothedScore < this.config.intervention_policy.score_thresholds.low_focus_entry) {
          this.lastNudgeTimestamp = now;

          telemetryService.logEvent({
            event: "intervention_triggered",
            score: smoothedScore,
            attn: { gaze: features.gazeDeviation, audio: null, hr: null },
            context: {
              action_taken: "SHOW_FOCUS_NUDGE",
              primary_cause: "gaze", // Simplified for MVP
            }
          });

          return { type: "SHOW_FOCUS_NUDGE", level: 1 };
        }
      }
    }

    // Check for confusion help suggestion
    const confusionEvent = events.find(e => e.type === "CONFUSION");
    if (confusionEvent) {
        const cooldown = this.config.intervention_policy.cooldown_sec.confusion_help * 1000;
        if (now - this.lastHelpTimestamp > cooldown) {
            this.lastHelpTimestamp = now;

            telemetryService.logEvent({
              event: "intervention_triggered",
              score: smoothedScore,
              attn: { gaze: features.gazeDeviation, audio: null, hr: null },
              context: {
                action_taken: "SUGGEST_HELP",
                primary_cause: "blendshapes", // Simplified for MVP
              }
            });

            // In a real app, context would be more meaningful
            return { type: "SUGGEST_HELP", context: { message: "Detected confusion" } };
        }
    }

    return null;
  }
}
