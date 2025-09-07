"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export function StudentDrawer({ open, onOpenChange, name, logs }: { open: boolean; onOpenChange: (b: boolean) => void; name?: string; logs?: { date: string; mins: number; acc: number; flow: number }[] }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[360px]">
        <SheetHeader><SheetTitle>{name} の詳細</SheetTitle></SheetHeader>
        <div className="mt-3 text-sm">
          {!logs ? '読み込み中…' : (
            <ul className="space-y-1">
              {logs.map((l,i)=>(<li key={i} className="flex justify-between"><span>{l.date}</span><span>{l.mins}分</span><span>{Math.round(l.acc*100)}%</span><span>{l.flow}%</span></li>))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

