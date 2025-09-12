"use client";

import React from 'react';

type HeatItem = { date: string; value: number }

function valueToLevel(value: number, max: number) {
  if (!max || max <= 0) return 0
  if (value <= 0) return 0
  const t1 = max * 0.33
  const t2 = max * 0.66
  if (value <= t1) return 1
  if (value <= t2) return 2
  return 3
}

export default function NewHeatmap({ items }: { items: HeatItem[] }) {
  const max = items.reduce((m, it) => Math.max(m, it.value), 0)
  return (
    <section className="card p-6 mb-8">
      <h3 className="text-lg font-bold mb-4">学習ヒートマップ</h3>
      <div className="grid grid-cols-7 gap-1">
        {items.map((it) => {
          const lvl = valueToLevel(it.value, max)
          return <div key={it.date} title={`${it.date}: ${it.value}`} className={`heatmap-cell heatmap-cell-${lvl}`}></div>
        })}
      </div>
      <div className="flex justify-end items-center mt-4 text-xs text-gray-400">
        <span>少ない</span>
        <div className="heatmap-cell heatmap-cell-0 mx-1"></div>
        <div className="heatmap-cell heatmap-cell-1 mx-1"></div>
        <div className="heatmap-cell heatmap-cell-2 mx-1"></div>
        <div className="heatmap-cell heatmap-cell-3 mx-1"></div>
        <span>多い</span>
      </div>
    </section>
  );
}

