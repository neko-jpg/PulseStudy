"use client"

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'

export function ProfileHeader({ user, summary }: { user: { name: string; handle: string; avatar?: string }, summary: { mins: number; acc: number; streak: number; badges: number } }) {
  const ini = user.name?.charAt(0)?.toUpperCase() || 'U'
  return (
    <Card className="p-6">
      <div className="flex items-center">
        <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-3xl font-bold text-white mr-6">
          {ini}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white">{user.name}</h3>
          <p className="text-slate-400">@{user.handle}</p>
        </div>
        <div className="flex space-x-8 text-center">
          <div>
            <p className="text-slate-400 text-sm">合計</p>
            <p className="text-white text-lg font-semibold">{summary.mins}分</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">正答率</p>
            <p className="text-white text-lg font-semibold">{Math.round(summary.acc * 100)}%</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">連続</p>
            <p className="text-white text-lg font-semibold">{summary.streak}日</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

