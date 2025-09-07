"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function TopImprovements({ items, onClick }: { items: string[]; onClick: (id: string) => void }) {
  if (!items?.length) return null
  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-semibold mb-2">伸びしろ Top3</div>
        <div className="grid gap-2">
          {items.map((id) => (
            <div key={id} className="flex items-center justify-between">
              <div className="text-sm">{id}</div>
              <Link href={`/learn?module=${id}&source=analytics`} onClick={() => onClick(id)}>
                <Button size="sm">今すぐ始める</Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

