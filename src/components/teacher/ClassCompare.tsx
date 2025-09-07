"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

type ClassItem = { id: string; name: string }

export function ClassCompare() {
  const [classes, setClasses] = useState<ClassItem[]>([])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const cs = await fetch('/api/classes', { cache: 'no-store' }).then(r => r.json())
      setClasses(cs.items || [])
      const arr: any[] = []
      for (const c of (cs.items || [])) {
        const s = await fetch(`/api/classes/${c.id}/summary`, { cache: 'no-store' }).then(r => r.json())
        arr.push({ name: c.name, mins: s.mins, acc: Math.round((s.acc || 0) * 100), flow: s.flow })
      }
      setData(arr)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <Card>
      <CardContent className="p-4">
        <div className="font-semibold mb-2">クラス比較（mins/acc/flow）</div>
        {loading ? (
          <div className="text-sm text-muted-foreground">読み込み中…</div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="mins" fill="#8884d8" name="分" />
                <Bar dataKey="acc" fill="#82ca9d" name="正答%" />
                <Bar dataKey="flow" fill="#ffc658" name="Flow%" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

