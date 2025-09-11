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
      const privateKey = privateKeyRaw.replace(/\\n/g, '\n')
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
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

