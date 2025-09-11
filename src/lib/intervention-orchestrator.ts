import type { FocusOutput } from "./focus-meter/types";
import { telemetryService } from "./telemetry";

export type InterventionAction = {
  type: "SHOW_FOCUS_NUDGE";
  level: number; // e.g., 1 for subtle, 2 for stronger
} | {
  type: "SUGGEST_HELP";
  context: any; // e.g., info about the content being viewed
};

// Configuration values previously in pulse-config.json
const INTERVENTION_POLICY = {
  cooldown_sec: {
    distraction_nudge: 90,
    confusion_help: 120,
  },
  score_thresholds: {
    low_focus_entry: 0.4,
  }
};

export class InterventionOrchestrator {
  private lastNudgeTimestamp: number = 0;
  private lastHelpTimestamp: number = 0;

  constructor() {}

  /**
   * Processes the Focus Meter output and determines if an intervention is warranted.
   * @param engineOutput The latest output from the FocusMeter.
   * @returns An InterventionAction or null if no action is needed.
   */
  public getAction(engineOutput: FocusOutput): InterventionAction | null {
    const { value, events, features } = engineOutput;
    const now = Date.now();

    // Check for distraction nudge
    const distractionEvent = events.find(e => e.kind === "distraction");
    if (distractionEvent) {
      const cooldown = INTERVENTION_POLICY.cooldown_sec.distraction_nudge * 1000;
      if (now - this.lastNudgeTimestamp > cooldown) {
        if (value < INTERVENTION_POLICY.score_thresholds.low_focus_entry) {
          this.lastNudgeTimestamp = now;

          telemetryService.logEvent({
            event: "intervention_triggered",
            score: value,
            attn: { gaze: features.gazeDev, audio: null, hr: null },
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
    const confusionEvent = events.find(e => e.kind === "confusion");
    if (confusionEvent) {
        const cooldown = INTERVENTION_POLICY.cooldown_sec.confusion_help * 1000;
        if (now - this.lastHelpTimestamp > cooldown) {
            this.lastHelpTimestamp = now;

            telemetryService.logEvent({
              event: "intervention_triggered",
              score: value,
              attn: { gaze: features.gazeDev, audio: null, hr: null },
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
