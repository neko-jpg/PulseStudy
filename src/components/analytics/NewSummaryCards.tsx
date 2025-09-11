import React from 'react';
import { Clock, CheckCircle2, Brain, Loader2 } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  grade?: string;
  colorClass?: string;
}

function SummaryCard({ title, value, unit, icon, grade, colorClass }: SummaryCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        {icon}
      </div>
      <div className="flex items-baseline space-x-2">
        <p className={`text-4xl font-bold ${colorClass || ''}`}>
          {value}
          <span className="text-lg font-normal">{unit}</span>
        </p>
        {grade && (
            <p className={`text-3xl font-bold ${colorClass || ''}`}>{grade}</p>
        )}
      </div>
      <a className="text-blue-400 text-sm mt-2 inline-block" href="#">詳細を見る</a>
    </div>
  );
}

interface NewSummaryCardsProps {
  isLoading: boolean;
  totalStudyMinutes: number;
  averageFocus: number;
}

// Helper function to get grade and color based on focus score
const getFocusGrade = (score: number) => {
    const roundedScore = Math.round(score);
    if (roundedScore >= 95) return { grade: 'S', colorClass: 'text-purple-400' };
    if (roundedScore >= 90) return { grade: 'A+', colorClass: 'text-green-400' };
    if (roundedScore >= 80) return { grade: 'A', colorClass: 'text-green-400' };
    if (roundedScore >= 70) return { grade: 'B', colorClass: 'text-yellow-400' };
    if (roundedScore >= 60) return { grade: 'C', colorClass: 'text-orange-400' };
    return { grade: 'D', colorClass: 'text-red-500' };
}

export default function NewSummaryCards({ isLoading, totalStudyMinutes, averageFocus }: NewSummaryCardsProps) {
  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-6 flex items-center justify-center h-40">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        ))}
      </section>
    );
  }

  const focusInfo = getFocusGrade(averageFocus);

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
        grade={focusInfo.grade}
        colorClass={focusInfo.colorClass}
      />
    </section>
  );
}
