import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const uid = searchParams.get('uid')
  if (!uid) {
    return NextResponse.json({ error: 'Missing uid' }, { status: 400 })
  }

  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(snap.data(), {
    headers: { 'Cache-Control': 'no-store' },
  })
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
