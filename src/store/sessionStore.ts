import { create } from 'zustand';
import { doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from './authStore';
import { useFocusStore } from './focusStore';
import { usePrivacyStore } from './privacyStore'; // Import privacy store
import { openDB, DBSchema } from 'idb';
import { auth } from '@/lib/firebase';

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
    // Check for camera consent before starting (skip in demo mode for smoothness)
    const demo = process.env.NEXT_PUBLIC_DEMO === '1'
    const { cameraConsent, setCameraConsent } = usePrivacyStore.getState();
    if (!demo && cameraConsent !== 'granted') {
      console.warn("Camera consent not granted. Session cannot start.");
      if (cameraConsent === 'prompt') {
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

    const avgFocusRaw = countFocus > 0 ? sumFocus / countFocus : 0;
    const avgFocus = Math.round(Math.min(100, Math.max(0, avgFocusRaw * 100)));

    // Persist latest focus locally for demo/summary to pick up immediately
    try {
      if (typeof document !== 'undefined') {
        document.cookie = `lastAvgFocus=${encodeURIComponent(String(avgFocus))}; path=/; max-age=${60*60*24*7}`
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('lastAvgFocus', String(avgFocus))
      }
    } catch {}

    // Prepare API payload (safe JSON)
    const payload = {
      sessionId,
      moduleId: moduleId || null,
      startedAtMs: startedAt,
      durationSec,
      sumFocus,
      countFocus,
      avgFocus,
      status: finalStatus as 'completed' | 'aborted',
      // helpful for dev-mode fallback on server
      ownerUid: user.uid,
    };

    try {
      // Try to attach ID token if available
      let authHeader: Record<string, string> = {}
      try {
        const token = await (auth?.currentUser?.getIdToken?.() ?? Promise.resolve(undefined))
        if (token) authHeader = { Authorization: `Bearer ${token}` }
      } catch {}

      // Try sendBeacon first for reliability on navigation, then fetch
      try {
        const json = JSON.stringify(payload)
        const url = '/api/analytics/session'
        if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
          const blob = new Blob([json], { type: 'application/json' })
          ;(navigator as any).sendBeacon(url, blob)
        }
      } catch {}

      const res = await fetch('/api/analytics/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // dev/testing convenience; ignored in prod by server
          'x-dev-uid': user.uid,
          ...authHeader,
        },
        body: JSON.stringify(payload),
        keepalive: true,
      })

      if (!res.ok) {
        console.warn('Session API returned non-OK, caching offline')
        await saveSessionOffline(sessionId, payload)
      } else {
        console.log(`Session finalized and saved via API: ${sessionId}`)
      }
    } catch (error) {
      console.error("Failed to call session API, saving offline:", error);
      await saveSessionOffline(sessionId, payload);
    } finally {
      set({ status: 'idle', sessionId: null, startedAt: null, sumFocus: 0, countFocus: 0, moduleId: null });
    }
  },

  syncOfflineData: async () => {
    const idb = await getDb();
    let cursor = await idb.transaction('pending-sessions').store.openCursor();
    while (cursor) {
      const sessionId = cursor.key as string;
      const payload = cursor.value as any;
      const user = useAuthStore.getState().user;

      // Ensure current user matches cached owner for safety
      if (user && user.uid === payload.ownerUid) {
        try {
          let authHeader: Record<string, string> = {}
          try {
            const token = await (auth?.currentUser?.getIdToken?.() ?? Promise.resolve(undefined))
            if (token) authHeader = { Authorization: `Bearer ${token}` }
          } catch {}

          const res = await fetch('/api/analytics/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-dev-uid': user.uid,
              ...authHeader,
            },
            body: JSON.stringify(payload),
          })
          if (res.ok) {
            console.log(`Successfully synced offline session: ${sessionId}`);
            await removeOfflineSession(sessionId);
          } else {
            console.warn(`Session sync returned ${res.status} for ${sessionId}, will retry later`)
          }
        } catch (error) {
          console.error(`Failed to sync offline session ${sessionId}:`, error);
          // continue to next; keep this one for a later retry
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
