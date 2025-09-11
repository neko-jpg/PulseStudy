import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const uid = searchParams.get('uid')

  // Hackathon-friendly fallback
  const mock = {
    user: { name: 'デモユーザー', handle: '@demo', avatar: undefined },
    summary: { mins: 120, acc: 0.78, streak: 3, badges: 2 },
    goals: { dailyMins: 20, weeklyMins: 100 },
    notifs: { learn: true, challenge: true, social: false },
    quiet: { start: '22:00', end: '07:00' },
    privacy: { mode: 'private' as const },
    plan: { tier: 'free' as const },
  }

  if (!uid) {
    return NextResponse.json(mock, { headers: { 'Cache-Control': 'no-store' } })
  }

  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    return NextResponse.json(mock, { headers: { 'Cache-Control': 'no-store' } })
  }
  const data = snap.data() || {}
  // Merge with defaults to ensure required keys exist
  const out = { ...mock, ...data }
  return NextResponse.json(out, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const data = await request.json()
  const { uid, ...profile } = data
  if (!uid) {
    return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
  }

  await setDoc(doc(db, 'users', uid), profile, { merge: true })
  return NextResponse.json({ ok: true })
}
