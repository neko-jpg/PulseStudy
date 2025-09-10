"use client";

export function Heatmap({
  cells,
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

  return (
    <div className="card p-6 mb-8">
      <h3 className="text-lg font-bold mb-4">学習のヒートマップ</h3>
      <div className="flex justify-between items-center text-xs text-gray-400 mb-2 px-1">
        {months.map(m => <span key={m}>{m}</span>)}
      </div>
      <div className="grid grid-flow-col grid-rows-7 gap-1">
        {cells.map((c) => (
          <div
            key={c.date}
            className={`heatmap-cell heatmap-cell-${level(c.value)}`}
            title={`${c.date}: ${c.value} mins`}
            onClick={() => onClick(c.date)}
            role="button"
            aria-label={`${c.date} の記録: ${c.value}分`}
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
    </div>
  );
}
