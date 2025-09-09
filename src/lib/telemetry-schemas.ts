/**
 * This file defines the data structures for telemetry events, based on the
 * technical design specification.
 */

/**
 * Represents a low-frequency sample of the user's pulse score and related data.
 * Sent via POST /pulse/samples
 */
export interface PulseScoreSample {
  /** Anonymous session identifier */
  sid: string;
  /** Unix timestamp (milliseconds) */
  ts: number;
  /** The smoothed pulse score at this moment */
  score: number;
  /** Attention weights from the fusion engine (mocked in MVP) */
  attn: {
    gaze: number;
    audio: number | null; // V2+
    hr: number | null;   // V3+
  };
  /** Quality metrics of the input signals */
  quality: {
    light: 'good' | 'low' | 'high'; // Simplified for now
    fps: number;
  };
}

/**
 * Represents a significant event detected by the Pulse Engine or an intervention
 * triggered by the orchestrator.
 * Sent via POST /pulse/events
 */
export interface PulseEvent {
    /** Anonymous session identifier */
    sid: string;
    /** Unix timestamp (milliseconds) */
    ts: number;
    /** Type of the event */
    event: 'confusion_rise' | 'distraction_start' | 'focus_recovered' | 'intervention_triggered';
    /** The pulse score at the time of the event */
    score: number;
    /** Attention weights (same as sample) */
    attn: {
      gaze: number;
      audio: number | null;
      hr: number | null;
    };
    /** Contextual information about the event */
    context: {
        /** The specific intervention shown to the user */
        action_taken?: 'SHOW_FOCUS_NUDGE' | 'SUGGEST_HELP';
        /** The feature that was the primary cause of the event */
        primary_cause?: 'gaze' | 'head_pose' | 'blendshapes';
        /** Any other relevant context, e.g., lesson ID */
        [key: string]: any;
    };
}
