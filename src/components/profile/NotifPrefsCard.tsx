"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'

export function NotifPrefsCard({ value, onSave, saving, quiet }: { value: { learn: boolean; challenge: boolean; social: boolean }, onSave: (v: { learn: boolean; challenge: boolean; social: boolean, quietStart?: string, quietEnd?: string }) => void, saving?: boolean, quiet?: { start: string, end: string } }) {
  const [learn, setLearn] = useState(value.learn)
  const [challenge, setChallenge] = useState(value.challenge)
  const [social, setSocial] = useState(value.social)

  const isDirty = useMemo(() => {
    return learn !== value.learn || challenge !== value.challenge || social !== value.social
  }, [learn, challenge, social, value])

  useEffect(() => {
    if (isDirty) {
      onSave({ learn, challenge, social, quietStart: quiet?.start, quietEnd: quiet?.end })
    }
  }, [learn, challenge, social])


  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">通知プリセット</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-300">学習通知</span>
          <Switch checked={learn} onCheckedChange={setLearn} disabled={saving} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300">チャレンジ</span>
          <Switch checked={challenge} onCheckedChange={setChallenge} disabled={saving} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300">ソーシャル</span>
          <Switch checked={social} onCheckedChange={setSocial} disabled={saving} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-300">サイレント時間</span>
          <span className="text-white font-medium">{quiet?.start || '22:00'}〜{quiet?.end || '07:00'}</span>
        </div>
      </div>
    </Card>
  )
}
