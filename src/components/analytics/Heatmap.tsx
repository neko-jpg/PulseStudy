"use client"

import { useMemo } from 'react'

export function Heatmap({ cells, onClick }: { cells: { date: string; value: number }[]; onClick: (date: string) => void }) {
  const weeks = useMemo(() => {
    const chunks: { date: string; value: number }[][] = []
    for (let i = 0; i < cells.length; i += 7) chunks.push(cells.slice(i, i + 7))
    return chunks
  }, [cells])

  function level(v: number) {
    if (v < 10) return 0
    if (v < 30) return 1
    if (v < 60) return 2
    if (v < 80) return 3
    return 4
  }

  return (
    <div className="grid grid-cols-7 gap-1" role="grid" aria-label="学習量ヒートマップ">
      {cells.map((c) => (
        <button
          key={c.date}
          className={`h-6 rounded ${['bg-neutral-200','bg-green-200','bg-green-400','bg-green-600','bg-green-800'][level(c.value)]}`}
          title={`${c.date}: ${c.value}`}
          onClick={() => onClick(c.date)}
          aria-label={`${c.date} の記録`}
        />
      ))}
    </div>
  )
}

