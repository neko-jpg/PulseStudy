"use client";

import { useState, useMemo } from 'react';
import { Bell, Clock3, TrendingDown, ClipboardList, RefreshCw } from 'lucide-react';
import { CategoryCard } from '@/components/learn-top/CategoryCard';
import { LearningModeSelector } from '@/components/learn-top/LearningModeSelector';
import { AiRecommendationCard, type Recommendation } from '@/components/learn-top/AiRecommendationCard';
import { useLearnSettingsStore } from '@/store/learnSettingsStore';

// Mock Data（日本語正常化）
const MOCK_RECOMMENDATIONS: Recommendation[] = [
  { moduleId: 'math-quad-1', title: '数学 二次関数のグラフ徹底解説', difficulty: '標準', durationMinutes: 5, category: 'review' },
  { moduleId: 'eng-infinitive-1', title: '英語 不定詞の使い方マスター', difficulty: '基礎', durationMinutes: 5, category: 'quick' },
  { moduleId: 'sci-cells-1', title: '理科 細胞の構造と働き', difficulty: '基礎', durationMinutes: 10, category: 'weakness' },
  { moduleId: 'prog-vars-1', title: 'プログラミング 変数とデータ型', difficulty: '基礎', durationMinutes: 5, category: 'quick' },
  { moduleId: 'hist-jpn-1', title: '歴史 鎌倉時代の流れを掴む', difficulty: '標準', durationMinutes: 15, category: 'test-prep' },
  { moduleId: 'eng-tenses-1', title: '英語 現在完了を10分で復習', difficulty: '標準', durationMinutes: 10, category: 'review' },
];

const CATEGORIES = [
  { id: 'quick', title: '5分クイック', icon: Clock3, color: 'text-blue-400' },
  { id: 'weakness', title: '苦手克服', icon: TrendingDown, color: 'text-red-400' },
  { id: 'test-prep', title: 'テスト対策', icon: ClipboardList, color: 'text-yellow-400' },
  { id: 'review', title: '復習', icon: RefreshCw, color: 'text-green-400' },
] as const;

type CategoryFilter = typeof CATEGORIES[number]['id'] | 'all';

export default function LearnTopPage() {
  const { learningMode, setLearningMode } = useLearnSettingsStore();
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');

  const filteredRecommendations = useMemo(() => {
    if (activeFilter === 'all') return MOCK_RECOMMENDATIONS;
    return MOCK_RECOMMENDATIONS.filter(rec => rec.category === activeFilter);
  }, [activeFilter]);

  return (
    <main className="bg-gray-900 flex-1 p-8 text-white">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">学習を始めよう</h2>
          <p className="text-gray-400">何を学びますか？</p>
        </div>
        <div className="relative">
          <Bell className="text-gray-400 text-3xl" />
          <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-gray-800"></span>
        </div>
      </header>

      <div className="bg-gray-800 p-6 rounded-xl mb-8"><p className="text-lg">AIがあなたに最適な学習を提案します。</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {CATEGORIES.map(cat => (
          <CategoryCard
            key={cat.id}
            icon={cat.icon}
            title={cat.title}
            iconColorClass={cat.color}
            isActive={activeFilter === cat.id}
            onClick={() => setActiveFilter(prev => prev === cat.id ? 'all' : cat.id)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="md:col-span-1">
          <LearningModeSelector currentMode={learningMode} onModeChange={setLearningMode} />
        </div>
      </div>

      <div>
        <h3 className="font-bold text-xl mb-4">AIおすすめ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map(rec => (
              <AiRecommendationCard key={rec.moduleId} recommendation={rec} />
            ))
          ) : (
            <div className="bg-gray-800 p-6 rounded-xl text-center md:col-span-2"><p className="text-gray-400">このカテゴリには、おすすめの学習項目は現在ありません。</p></div>
          )}
        </div>
      </div>
    </main>
  );
}
