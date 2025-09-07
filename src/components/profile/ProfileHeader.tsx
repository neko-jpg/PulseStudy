"use client"

import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function ProfileHeader({ user, summary }: { user: { name: string; handle: string; avatar?: string }, summary: { mins: number; acc: number; streak: number; badges: number } }) {
  const ini = user.name?.charAt(0)?.toUpperCase() || 'U'
  return (
    <div className="flex items-center gap-4 p-4 rounded border">
      <Avatar className="h-12 w-12">
        <AvatarFallback>{ini}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="text-base font-semibold">{user.name} <span className="text-xs text-muted-foreground">{user.handle}</span></div>
        <div className="flex gap-4 text-xs text-muted-foreground mt-1" aria-live="polite">
          <span>合計 {summary.mins}分</span>
          <span>正答 {Math.round(summary.acc * 100)}%</span>
          <span>連続 {summary.streak}日</span>
          <span>バッジ {summary.badges}</span>
        </div>
      </div>
    </div>
  )
}

