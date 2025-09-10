"use client";

import { useMemo } from 'react';

// Helper function to generate placeholder data for a full year.
const generatePlaceholderCells = () => {
  const cells = [];
  const today = new Date();
  // Go back roughly one year to start
  const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  // To align with a 7-day week grid, find the previous Sunday
  const dayOfWeek = startDate.getDay(); // 0=Sun, 1=Mon, ...
  startDate.setDate(startDate.getDate() - dayOfWeek);

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    cells.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 4), // Random level from 0 to 3
    });
  }
  return cells;
};


export function Heatmap({
  cells: initialCells,
  onClick,
}: {
  cells: { date: string; value: number }[];
  onClick: (date: string) => void;
}) {
  function level(v: number) {
    if (v === 0) return 0;
    if (v < 15) return 1;
    if (v < 45) return 2;
    return 3;
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // TODO: For UI verification, we are always generating placeholder data.
  // In a real application, this logic should be changed to use the `initialCells`
  // prop when it contains valid data.
  const cells = useMemo(() => {
    const placeholders = generatePlaceholderCells();
    return placeholders.map(p => ({...p, level: p.value}));
  }, []);


  return (
    <section className="card p-6 mb-8">
      <h3 className="text-lg font-bold mb-4">学習のヒートマップ</h3>
      <div className="flex justify-between items-center text-xs text-gray-400 mb-2 px-1">
        {months.map(m => <span key={m}>{m}</span>)}
      </div>
      <div className="grid grid-flow-col grid-rows-7 gap-1">
        {cells.map((c, index) => (
          <div
            key={c.date || index}
            className={`heatmap-cell heatmap-cell-${'level' in c ? c.level : level(c.value)}`}
            title={c.date ? `${c.date}: ${c.value} mins` : ''}
            onClick={() => c.date && onClick(c.date)}
            role={c.date ? "button" : "presentation"}
            aria-label={c.date ? `${c.date} の記録: ${c.value}分` : 'データなし'}
          />
        ))}
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
