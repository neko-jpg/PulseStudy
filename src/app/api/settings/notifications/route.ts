import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

export async function POST(request: Request) {
  const data = await request.json()
  const { uid, ...prefs } = data
  if (!uid) {
    return new Response('Missing uid', { status: 400 })
  }

  await setDoc(doc(db, 'users', uid), { notifs: prefs }, { merge: true })
  return new Response(null, { status: 204 })
}

