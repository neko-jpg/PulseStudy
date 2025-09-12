"use client";
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { startSession } from '@/lib/session';
import { MODULES } from '@/lib/modules';

export type Recommendation = {
  moduleId: string;
  title: string;
  difficulty: '基礎' | '標準' | '応用';
  durationMinutes: number;
  category: 'quick' | 'weakness' | 'test-prep' | 'review';
};

type AiRecommendationCardProps = {
  recommendation: Recommendation;
};

export function AiRecommendationCard({ recommendation }: AiRecommendationCardProps) {
  const { moduleId, title, difficulty, durationMinutes } = recommendation;
  const router = useRouter();

  const difficultyColorMap: Record<Recommendation['difficulty'], string> = {
    '基礎': 'bg-green-600',
    '標準': 'bg-gray-600',
    '応用': 'bg-red-600',
  };

  const available = MODULES.some(m => m.id === moduleId)

  async function onStart() {
    try {
      const data = await startSession({ moduleId });
      router.push(`/learn/${data.moduleId}/summary`);
    } catch {
      router.push(`/learn/${moduleId}/summary`);
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl flex flex-col">
      <h4 className="font-semibold text-lg flex-grow">{title}</h4>
      <div className="flex items-center text-gray-400 text-sm my-2">
        <span className={`${difficultyColorMap[difficulty]} px-2 py-1 rounded-md text-xs mr-2`}>
          {difficulty}
        </span>
        <Clock className="h-4 w-4 mr-1" />
        <span>{durationMinutes}分</span>
      </div>
      <button onClick={available ? onStart : undefined} disabled={!available} className={`w-full font-bold py-2 px-4 rounded-lg mt-4 ${available ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 cursor-not-allowed'}`}>
        {available ? '開始' : '近日公開'}
      </button>
    </div>
  );
}
