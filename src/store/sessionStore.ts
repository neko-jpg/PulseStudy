import { create } from 'zustand';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from './authStore';
import { useFocusStore } from './focusStore';

type SessionStatus = 'idle' | 'in_progress' | 'paused' | 'completed' | 'aborted';

interface SessionState {
  sessionId: string | null;
  status: SessionStatus;
  startedAt: number | null;
  sumFocus: number;
  countFocus: number;

  startSession: (moduleId?: string) => void;
  finalizeSession: (status?: 'completed' | 'aborted') => Promise<void>;
  _updateFocus: (score: number) => void;
}

const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: null,
  status: 'idle',
  startedAt: null,
  sumFocus: 0,
  countFocus: 0,

  startSession: (moduleId) => {
    // Prevent starting a new session if one is already in progress
    if (get().status === 'in_progress') {
      console.warn('Session already in progress.');
      return;
    }

    const newSessionId = crypto.randomUUID();
    set({
      sessionId: newSessionId,
      status: 'in_progress',
      startedAt: Date.now(),
      sumFocus: 0,
      countFocus: 0,
    });
    console.log(`Session started: ${newSessionId}`);
  },

  finalizeSession: async (finalStatus: 'completed' | 'aborted' = 'completed') => {
    const { status, sessionId, startedAt, sumFocus, countFocus } = get();
    if (status !== 'in_progress') {
      return; // No active session to finalize
    }

    const { user } = useAuthStore.getState();
    if (!user || !sessionId || !startedAt) {
      // Reset without saving if user is not logged in or session is invalid
      set({ status: 'idle', sessionId: null, startedAt: null });
      return;
    }

    // Mark as finalizing to prevent duplicate saves
    set({ status: 'paused' });

    const endedAt = Date.now();
    const durationSec = Math.round((endedAt - startedAt) / 1000);

    // As per user request, only save if duration is meaningful
    if (finalStatus === 'completed' && durationSec < 60) {
      console.log(`Session ${sessionId} was too short (${durationSec}s). Not saving.`);
      set({ status: 'idle', sessionId: null, startedAt: null, sumFocus: 0, countFocus: 0 });
      return;
    }

    const avgFocus = countFocus > 0 ? sumFocus / countFocus : 0;

    const sessionData = {
      ownerUid: user.uid,
      // moduleId: currentModuleId, // TODO: Pass this in
      startedAt: new Date(startedAt),
      endedAt: new Date(endedAt),
      durationSec,
      sumFocus,
      countFocus,
      avgFocus: Math.min(100, Math.max(0, avgFocus)), // Clamp between 0-100
      status: finalStatus,
    };

    try {
      const sessionRef = doc(db, `sessions/${user.uid}/items/${sessionId}`);
      await setDoc(sessionRef, sessionData, { merge: true });
      console.log(`Session finalized and saved: ${sessionId}`);
    } catch (error) {
      console.error("Failed to save session:", error);
      // TODO: Implement offline fallback (e.g., save to IndexedDB)
    } finally {
      // Reset state after finalizing
      set({ status: 'idle', sessionId: null, startedAt: null, sumFocus: 0, countFocus: 0 });
    }
  },

  _updateFocus: (score: number) => {
    if (get().status === 'in_progress') {
      set((state) => ({
        sumFocus: state.sumFocus + score,
        countFocus: state.countFocus + 1,
      }));
    }
  },
}));

// Subscribe to the focus store to automatically update the session
useFocusStore.subscribe(
  (state) => state.output.value,
  (focusValue) => {
    useSessionStore.getState()._updateFocus(focusValue);
  }
);

export { useSessionStore };
