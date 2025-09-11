import { PulseEvent, PulseScoreSample } from "./telemetry-schemas";
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

const LOG_PREFIX_EVENT = "[TELEMETRY EVENT]";
const LOG_PREFIX_SAMPLE = "[TELEMETRY SAMPLE]";

/**
 * A mock telemetry service that logs events to the console.
 * In a real application, this would send data to a server endpoint.
 */
class TelemetryService {
  private sessionId: string;
  private mode: 'mock' | 'live';

  constructor() {
    // Generate a simple, non-unique session ID for demonstration purposes.
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.mode = (process.env.TELEMETRY_MODE === 'live' ? 'live' : 'mock');
    console.log(`Telemetry service initialized with session ID: ${this.sessionId} [mode=${this.mode}]`);
  }

  /**
   * Logs a PulseEvent to the console.
   * In a real implementation, this would POST to /pulse/events.
   * @param eventData The partial event data. SID and timestamp will be added.
   */
  public async logEvent(eventData: Omit<PulseEvent, 'sid' | 'ts'>): Promise<void> {
    const event: PulseEvent = {
      ...eventData,
      sid: this.sessionId,
      ts: Date.now(),
    };
    if (this.mode === 'live') {
      try { await addDoc(collection(db, 'telemetry_events'), event) } catch (e) { console.warn('telemetry_event_failed', e) }
    } else {
      console.log(LOG_PREFIX_EVENT, JSON.stringify(event, null, 2));
    }
  }

  /**
   * Logs a PulseScoreSample to the console.
   * In a real implementation, this would POST to /pulse/samples.
   * @param sampleData The partial sample data. SID and timestamp will be added.
   */
  public async logSample(sampleData: Omit<PulseScoreSample, 'sid' | 'ts'>): Promise<void> {
    const sample: PulseScoreSample = {
      ...sampleData,
      sid: this.sessionId,
      ts: Date.now(),
    };
    if (this.mode === 'live') {
      try { await addDoc(collection(db, 'telemetry_samples'), sample) } catch (e) { console.warn('telemetry_sample_failed', e) }
    } else {
      console.log(LOG_PREFIX_SAMPLE, JSON.stringify(sample, null, 2));
    }
  }
}

// Export a singleton instance of the service
export const telemetryService = new TelemetryService();
