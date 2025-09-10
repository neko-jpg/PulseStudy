import Link from 'next/link';
import { Clock } from 'lucide-react';

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

  const difficultyColorMap = {
    '基礎': 'bg-green-600',
    '標準': 'bg-gray-600',
    '応用': 'bg-red-600',
  };

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
      <Link href={`/learn?module=${moduleId}`} passHref>
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg mt-4">
          開始
        </button>
      </Link>
    </div>
  );
}
