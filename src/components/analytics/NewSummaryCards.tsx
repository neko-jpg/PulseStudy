import React from 'react';
import { Clock, CheckCircle2, Brain } from 'lucide-react';

export default function NewSummaryCards() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">学習時間</h3>
          <Clock className="text-blue-400 h-6 w-6" />
        </div>
        <p className="text-3xl font-bold">38<span className="text-lg font-normal">分</span></p>
        <a className="text-blue-400 text-sm mt-2 inline-block" href="#">詳細を見る</a>
      </div>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">正答率</h3>
          <CheckCircle2 className="text-green-400 h-6 w-6" />
        </div>
        <p className="text-3xl font-bold">78<span className="text-lg font-normal">%</span></p>
        <a className="text-blue-400 text-sm mt-2 inline-block" href="#">詳細を見る</a>
      </div>
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">平均集中度</h3>
          <Brain className="text-yellow-400 h-6 w-6" />
        </div>
        <p className="text-3xl font-bold">50<span className="text-lg font-normal">%</span></p>
        <a className="text-blue-400 text-sm mt-2 inline-block" href="#">詳細を見る</a>
      </div>
    </section>
  );
}
