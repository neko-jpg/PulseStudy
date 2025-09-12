import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Admin SDK once per server runtime
function ensureAdmin() {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY

    // Prefer explicit service account if provided; else fall back to ADC
    if (projectId && clientEmail && privateKeyRaw) {
      // Normalize PEM: support values copied as "\n" or "\\n" and trim stray quotes/CRLFs
      let pk = privateKeyRaw.trim()
      if ((pk.startsWith("\"") && pk.endsWith("\"")) || (pk.startsWith("'") && pk.endsWith("'"))) {
        pk = pk.slice(1, -1)
      }
      pk = pk
        .replace(/\\r\\n/g, '\n')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\n')
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
      try {
        initializeApp({ credential: cert({ projectId, clientEmail, privateKey: pk }) })
      } catch (e) {
        // Fall back to ADC if PEM failed to parse
        initializeApp({ credential: applicationDefault() })
      }
    } else {
      initializeApp({ credential: applicationDefault() })
    }
  }
}

export function getAdminAuth() {
  ensureAdmin()
  return getAuth()
}

export function getAdminDb() {
  ensureAdmin()
  return getFirestore()
}
