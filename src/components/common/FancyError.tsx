"use client"

import { AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function FancyError({ message = '読み込みに失敗しました。', onRetry, subtle }: { message?: string; onRetry: () => void; subtle?: boolean }) {
  const [sec, setSec] = useState(5)
  useEffect(() => {
    const t = setInterval(() => setSec((s) => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (sec === 0) onRetry()
  }, [sec, onRetry])
  return (
    <Card className={`p-6 text-center ${subtle ? 'border-muted' : ''}`}>
      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-amber-100 text-amber-700 p-3"><AlertTriangle className="h-6 w-6" /></div>
        <div className="text-sm text-muted-foreground">{message}</div>
        <Button onClick={onRetry} className="mt-1" aria-label="再試行">再試行</Button>
        <div className="text-xs text-muted-foreground">{sec}秒後に自動で再試行します</div>
      </div>
    </Card>
  )
}

