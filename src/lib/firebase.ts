// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfigValues = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const envVarNames: { [key: string]: string } = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  storageBucket: "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
};

const missingEnvVars = (Object.keys(firebaseConfigValues) as Array<keyof typeof firebaseConfigValues>).filter(key => {
  return !firebaseConfigValues[key];
});

if (missingEnvVars.length > 0) {
  const missingVarDisplayNames = missingEnvVars.map(key => envVarNames[key]);
  throw new Error(`Missing Firebase config: ${missingVarDisplayNames.join(', ')}. Please check your .env file.`);
}

// All env vars are present, so we can assert they are strings.
const firebaseConfig = firebaseConfigValues as { [key in keyof typeof firebaseConfigValues]: string };

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
