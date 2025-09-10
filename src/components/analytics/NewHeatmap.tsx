"use client";

import React, { useEffect, useState } from 'react';

export default function NewHeatmap() {
  const [cells, setCells] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    // This effect replicates the logic from the original HTML's <script> tag.
    const initialCells = [
      <div key="c1" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c2" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c3" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c4" className="heatmap-cell heatmap-cell-1"></div>,
      <div key="c5" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c6" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c7" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c8" className="heatmap-cell heatmap-cell-1"></div>,
      <div key="c9" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c10" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c11" className="heatmap-cell heatmap-cell-2"></div>,
      <div key="c12" className="heatmap-cell heatmap-cell-1"></div>,
      <div key="c13" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c14" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c15" className="heatmap-cell heatmap-cell-2"></div>,
      <div key="c16" className="heatmap-cell heatmap-cell-1"></div>,
      <div key="c17" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c18" className="heatmap-cell heatmap-cell-3"></div>,
      <div key="c19" className="heatmap-cell heatmap-cell-1"></div>,
      <div key="c20" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c21" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c22" className="heatmap-cell heatmap-cell-1"></div>,
      <div key="c23" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c24" className="heatmap-cell heatmap-cell-1"></div>,
      <div key="c25" className="heatmap-cell heatmap-cell-2"></div>,
      <div key="c26" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c27" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c28" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c29" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c30" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c31" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c32" className="heatmap-cell heatmap-cell-1"></div>,
      <div key="c33" className="heatmap-cell heatmap-cell-1"></div>,
      <div key="c34" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c35" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c36" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c37" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c38" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c39" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c40" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c41" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c42" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c43" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c44" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c45" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c46" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c47" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c48" className="heatmap-cell heatmap-cell-0"></div>,
      <div key="c49" className="heatmap-cell heatmap-cell-0"></div>,
    ];

    const generatedCells = [];
    for (let i = 0; i < 51 * 7; i++) { // Generate for roughly a year (51 weeks)
      const random = Math.floor(Math.random() * 4);
      generatedCells.push(
        <div key={`gen-${i}`} className={`heatmap-cell heatmap-cell-${random}`}></div>
      );
    }

    setCells([...initialCells, ...generatedCells]);
  }, []);

  return (
    <section className="card p-6 mb-8">
      <h3 className="text-lg font-bold mb-4">学習のヒートマップ</h3>
      <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
      </div>
      <div className="grid grid-flow-col grid-rows-7 gap-1">
        {cells}
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
