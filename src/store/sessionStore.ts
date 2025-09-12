import { create } from 'zustand';
import { doc, setDoc, serverTimestamp, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from './authStore';
import { useFocusStore } from './focusStore';
import { usePrivacyStore } from './privacyStore'; // Import privacy store
import { openDB, DBSchema } from 'idb';

// --- IndexedDB Setup for Offline Sessions ---
interface OfflineDB extends DBSchema {
  'pending-sessions': {
    key: string;
    value: any;
  };
}

async function getDb() {
  return openDB<OfflineDB>('offline-session-store', 1, {
    upgrade(db) {
      db.createObjectStore('pending-sessions');
    },
  });
}

async function saveSessionOffline(sessionId: string, sessionData: any) {
  try {
    const db = await getDb();
    await db.put('pending-sessions', sessionData, sessionId);
    console.log(`Session ${sessionId} saved offline.`);
  } catch (error) {
    console.error("Failed to save session to IndexedDB:", error);
  }
}

async function getOfflineSessions() {
  const db = await getDb();
  return db.getAll('pending-sessions');
}

async function removeOfflineSession(sessionId: string) {
  const db = await getDb();
  await db.delete('pending-sessions', sessionId);
}
// --- End of IndexedDB Setup ---


type SessionStatus = 'idle' | 'in_progress' | 'paused' | 'completed' | 'aborted';

interface SessionState {
  sessionId: string | null;
  moduleId: string | null;
  status: SessionStatus;
  startedAt: number | null;
  sumFocus: number;
  countFocus: number;

  startSession: (moduleId?: string) => void;
  finalizeSession: (status?: 'completed' | 'aborted') => Promise<void>;
  _updateFocus: (score: number) => void;
  syncOfflineData: () => Promise<void>;
}

const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: null,
  moduleId: null,
  status: 'idle',
  startedAt: null,
  sumFocus: 0,
  countFocus: 0,

  startSession: (moduleId) => {
    // Check for camera consent before starting
    const { cameraConsent, setCameraConsent } = usePrivacyStore.getState();
    if (cameraConsent !== 'granted') {
      console.warn("Camera consent not granted. Session cannot start.");
      // Ensure the prompt is shown to the user if they try to start a session without deciding
      if (cameraConsent === 'prompt') {
        // This is a bit of a hack, but ensures the modal logic is triggered
        setCameraConsent('prompt');
      }
      return;
    }

    if (get().status === 'in_progress') {
      console.warn('Session already in progress.');
      return;
    }
    const newSessionId = crypto.randomUUID();
    set({
      sessionId: newSessionId,
      moduleId: moduleId || null,
      status: 'in_progress',
      startedAt: Date.now(),
      sumFocus: 0,
      countFocus: 0,
    });
    console.log(`Session started: ${newSessionId} for module ${moduleId}`);

    // Add to active_sessions for heartbeat
    try {
      const heartbeatRef = doc(db, 'active_sessions', newSessionId);
      setDoc(heartbeatRef, { startedAt: serverTimestamp() });
    } catch (e) {
      console.error("Failed to set heartbeat", e);
    }
  },

  finalizeSession: async (finalStatus: 'completed' | 'aborted' = 'completed') => {
    const { status, sessionId, startedAt, sumFocus, countFocus, moduleId } = get();
    if (status !== 'in_progress' || !sessionId || !startedAt) {
      return;
    }

    // Remove from active_sessions for heartbeat
    try {
      const heartbeatRef = doc(db, 'active_sessions', sessionId);
      deleteDoc(heartbeatRef);
    } catch (e) {
      console.error("Failed to delete heartbeat", e);
    }

    const { user } = useAuthStore.getState();
    if (!user) {
      set({ status: 'idle', sessionId: null, startedAt: null, moduleId: null });
      return;
    }

    set({ status: 'paused' });

    const endedAt = Date.now();
    const durationSec = Math.round((endedAt - startedAt) / 1000);

    if (finalStatus === 'completed' && durationSec < 60) {
      console.log(`Session ${sessionId} was too short. Not saving.`);
      set({ status: 'idle', sessionId: null, startedAt: null, sumFocus: 0, countFocus: 0, moduleId: null });
      return;
    }

    const avgFocus = countFocus > 0 ? sumFocus / countFocus : 0;
    const sessionData = {
      ownerUid: user.uid,
      moduleId: moduleId,
      startedAt: Timestamp.fromDate(new Date(startedAt)),
      endedAt: serverTimestamp(),
      durationSec,
      sumFocus,
      countFocus,
      avgFocus: Math.round(Math.min(100, Math.max(0, avgFocus))),
      status: finalStatus,
    };

    try {
      const sessionRef = doc(db, `sessions/${user.uid}/items/${sessionId}`);
      await setDoc(sessionRef, sessionData, { merge: true });
      console.log(`Session finalized and saved: ${sessionId}`);
    } catch (error) {
      console.error("Failed to save session to Firestore, saving offline:", error);
      await saveSessionOffline(sessionId, sessionData);
    } finally {
      set({ status: 'idle', sessionId: null, startedAt: null, sumFocus: 0, countFocus: 0, moduleId: null });
    }
  },

  syncOfflineData: async () => {
    const idb = await getDb();
    let cursor = await idb.transaction('pending-sessions').store.openCursor();
    while(cursor) {
        const sessionId = cursor.key as string;
        const sessionData = cursor.value;
        const user = useAuthStore.getState().user;

        if (user && user.uid === sessionData.ownerUid) {
            try {
                const sessionRef = doc(db, `sessions/${user.uid}/items/${sessionId}`);
                await setDoc(sessionRef, sessionData, { merge: true });
                console.log(`Successfully synced offline session: ${sessionId}`);
                await removeOfflineSession(sessionId);
            } catch (error) {
                console.error(`Failed to sync offline session ${sessionId}:`, error);
                // Stop trying if one fails to preserve order, or continue? For now, continue.
            }
        }
        cursor = await cursor.continue();
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

// --- Listeners for Offline Sync ---
if (typeof window !== 'undefined') {
    useSessionStore.getState().syncOfflineData();
    window.addEventListener('online', () => {
        console.log("Back online, attempting to sync offline data...");
        useSessionStore.getState().syncOfflineData();
    });
}
// --- End of Listeners ---

;(useFocusStore as any).subscribe(
  (state: any) => state.output.value,
  (focusValue: number) => { useSessionStore.getState()._updateFocus(focusValue) }
)

export { useSessionStore };
