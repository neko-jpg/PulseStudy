import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  // Remote config for thresholds/frequencies (can be read from env in the future)
  return NextResponse.json({
    distractionThreshold: 0.6,
    distractionDurationMs: 5000,
    nudgeCooldownMs: 5000,
    pointsIntervalMs: 60000,
    batchSec: 5,
  })
}

