import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    user: { name: 'Teppei', handle: '@neko_jpg', avatar: '' },
    summary: { mins: 124, acc: 0.74, streak: 7, badges: 3 },
    goals: { dailyMins: 20, weeklyMins: 120 },
    notifs: { learn: true, challenge: true, social: false },
    quiet: { start: '22:00', end: '07:00' },
    privacy: { mode: 'link' },
    plan: { tier: 'free' },
  }, { headers: { 'Cache-Control': 'no-store' } })
}
