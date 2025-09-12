import { NextResponse } from 'next/server'
import { peekRoom, seedRoom } from '../../../rooms/state'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { getAdminDb } from '@/lib/firebaseAdmin'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let room = peekRoom(id)
  if (!room) {
    try {
      // Try Admin first (bypass rules); fallback to client if admin not configured
      let data: any | null = null
      try {
        const adb = getAdminDb()
        const s = await adb.doc(`rooms/${id}`).get()
        if (s.exists) data = s.data()
      } catch {}
      if (!data && db) {
        const snap = await getDoc(doc(db as any, 'rooms', id) as any)
        if (snap.exists()) data = snap.data() as any
      }
      if (data) {
        room = seedRoom(id)
        // Sanitize meta (type/length)
        const rawName = typeof data?.name === 'string' ? data.name.trim() : ''
        const safeName = rawName && rawName.length <= 100 ? rawName : room.name
        const rawDesc = typeof data?.description === 'string' ? data.description.trim() : ''
        const safeDesc = rawDesc.slice(0, 500)
        const safePublic = typeof data?.isPublic === 'boolean' ? data.isPublic : true
        room.name = safeName
        room.description = safeDesc
        room.isPublic = safePublic
      }
    } catch (e) {
      console.error('state_fallback_error', e)
    }
  }
  if (!room) return new Response(null, { status: 404 })
  return NextResponse.json(room, { headers: { 'Cache-Control': 'no-store' } })
}
