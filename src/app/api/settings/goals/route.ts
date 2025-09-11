import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'

export async function POST(request: Request) {
  const data = await request.json()
  const { uid, dailyMins, weeklyMins } = data
  if (!uid) {
    return new Response('Missing uid', { status: 400 })
  }

  await setDoc(
    doc(db, 'users', uid),
    { goals: { dailyMins, weeklyMins } },
    { merge: true },
  )
  return new Response(null, { status: 204 })
}

