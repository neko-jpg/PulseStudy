import React from 'react';
import { Clock, CheckCircle2, Brain, Loader2 } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  linkText?: string;
  linkHref?: string;
}

function SummaryCard({ title, value, unit, icon }: SummaryCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold">
        {value}
        <span className="text-lg font-normal">{unit}</span>
      </p>
      <a className="text-blue-400 text-sm mt-2 inline-block" href="#">詳細を見る</a>
    </div>
  );
}

interface NewSummaryCardsProps {
  isLoading: boolean;
  totalStudyMinutes: number;
  averageFocus: number;
  // correctRate is not tracked yet, so we'll use a placeholder
}

export default function NewSummaryCards({ isLoading, totalStudyMinutes, averageFocus }: NewSummaryCardsProps) {
  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 flex items-center justify-center h-36">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
        <div className="card p-6 flex items-center justify-center h-36">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
        <div className="card p-6 flex items-center justify-center h-36">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <SummaryCard
        title="学習時間"
        value={totalStudyMinutes}
        unit="分"
        icon={<Clock className="text-blue-400 h-6 w-6" />}
      />
      <SummaryCard
        title="正答率"
        value={78} // Placeholder as per original design
        unit="%"
        icon={<CheckCircle2 className="text-green-400 h-6 w-6" />}
      />
      <SummaryCard
        title="平均集中度"
        value={Math.round(averageFocus)}
        unit="%"
        icon={<Brain className="text-yellow-400 h-6 w-6" />}
      />
    </section>
  );
}
