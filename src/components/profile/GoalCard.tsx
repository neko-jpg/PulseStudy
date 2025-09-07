"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function GoalCard({ value, onSave, saving }: { value: { dailyMins: number; weeklyMins: number }, onSave: (v: { dailyMins: number; weeklyMins: number }) => void, saving?: boolean }) {
  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const d = Number((form.elements.namedItem('dailyMins') as HTMLInputElement).value)
    const w = Number((form.elements.namedItem('weeklyMins') as HTMLInputElement).value)
    onSave({ dailyMins: d, weeklyMins: w })
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-semibold mb-2">目標（分）</div>
        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-2 items-end">
          <div>
            <label className="block text-xs mb-1" htmlFor="dailyMins">1日の目標</label>
            <Input id="dailyMins" name="dailyMins" type="number" min={0} defaultValue={value.dailyMins} aria-label="1日の目標分" />
          </div>
          <div>
            <label className="block text-xs mb-1" htmlFor="weeklyMins">週の目標</label>
            <Input id="weeklyMins" name="weeklyMins" type="number" min={0} defaultValue={value.weeklyMins} aria-label="週の目標分" />
          </div>
          <div className="col-span-2">
            <Button type="submit" disabled={saving} aria-label="目標を保存">{saving ? '保存中...' : '保存'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

