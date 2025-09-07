"use client"

import Link from 'next/link'
import { Flame, Trophy } from 'lucide-react'

export function ChallengeStrip({ streakDays = 0 }: { streakDays?: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-500" aria-hidden />
        <div>
          <div className="text-sm font-medium">連続学習日数</div>
          <div className="text-xs text-muted-foreground" aria-live="polite">{streakDays}日継続中</div>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2 text-sm">
        <Trophy className="h-4 w-4" aria-hidden />
        <Link href="/challenge" aria-label="チャレンジの詳細へ">チャレンジを見る</Link>
      </div>
    </div>
  )
}

