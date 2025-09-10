"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export function GoalCard({ value, onSave, saving }: { value: { dailyMins: number; weeklyMins: number }, onSave: (v: { dailyMins: number; weeklyMins: number }) => void, saving?: boolean }) {
  const [daily, setDaily] = useState(value.dailyMins)
  const [weekly, setWeekly] = useState(value.weeklyMins)

  useEffect(() => {
    setDaily(value.dailyMins)
    setWeekly(value.weeklyMins)
  }, [value])

  function handleSave() {
    if (daily === value.dailyMins && weekly === value.weeklyMins) return
    onSave({ dailyMins: daily, weeklyMins: weekly })
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">目標 (分)</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-slate-300" htmlFor="daily-goal">1日の目標</label>
          <Input
            id="daily-goal"
            type="number"
            value={daily}
            onChange={(e) => setDaily(Number(e.target.value))}
            onBlur={handleSave}
            className="w-24 text-center bg-slate-700 border-slate-600"
            disabled={saving}
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-slate-300" htmlFor="weekly-goal">週間の目標</label>
          <Input
            id="weekly-goal"
            type="number"
            value={weekly}
            onChange={(e) => setWeekly(Number(e.target.value))}
            onBlur={handleSave}
            className="w-24 text-center bg-slate-700 border-slate-600"
            disabled={saving}
          />
        </div>
      </div>
    </Card>
  )
}

