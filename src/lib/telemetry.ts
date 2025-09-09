import { PulseEvent, PulseScoreSample } from "./telemetry-schemas";

const LOG_PREFIX_EVENT = "[TELEMETRY EVENT]";
const LOG_PREFIX_SAMPLE = "[TELEMETRY SAMPLE]";

/**
 * A mock telemetry service that logs events to the console.
 * In a real application, this would send data to a server endpoint.
 */
class TelemetryService {
  private sessionId: string;

  constructor() {
    // Generate a simple, non-unique session ID for demonstration purposes.
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    console.log(`Telemetry service initialized with session ID: ${this.sessionId}`);
  }

  /**
   * Logs a PulseEvent to the console.
   * In a real implementation, this would POST to /pulse/events.
   * @param eventData The partial event data. SID and timestamp will be added.
   */
  public logEvent(eventData: Omit<PulseEvent, 'sid' | 'ts'>): void {
    const event: PulseEvent = {
      ...eventData,
      sid: this.sessionId,
      ts: Date.now(),
    };
    console.log(LOG_PREFIX_EVENT, JSON.stringify(event, null, 2));
  }

  /**
   * Logs a PulseScoreSample to the console.
   * In a real implementation, this would POST to /pulse/samples.
   * @param sampleData The partial sample data. SID and timestamp will be added.
   */
  public logSample(sampleData: Omit<PulseScoreSample, 'sid' | 'ts'>): void {
    const sample: PulseScoreSample = {
      ...sampleData,
      sid: this.sessionId,
      ts: Date.now(),
    };
    console.log(LOG_PREFIX_SAMPLE, JSON.stringify(sample, null, 2));
  }
}

// Export a singleton instance of the service
export const telemetryService = new TelemetryService();
