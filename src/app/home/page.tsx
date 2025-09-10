'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { StudyFocusCard } from '@/components/dashboard/StudyFocusCard';
import { FocusGraph } from '@/components/dashboard/FocusGraph';
import { QuickStart, type QuickStartItem } from '@/components/dashboard/QuickStart';
import { ChallengesCarousel, type Challenge } from '@/components/dashboard/ChallengesCarousel';
import { FocusModal } from '@/components/dashboard/FocusModal';
import './new-home.css';

// Mock data for the components
const MOCK_USER_NAME = '葵';
const MOCK_HAS_NOTIFICATIONS = true;

const MOCK_STUDY_FOCUS_CARD_PROPS = {
  aiCommand: 'AIからの今日の司令: 苦手分野を克服し、自信をつけましょう！',
  taskTitle: '不定詞の基礎を理解',
  focusPoints: 15,
  durationMinutes: 5,
  questionCount: 4,
  progressPercentage: 25,
  taskUrl: '/learn/eng-infinitive-1/summary',
};

const MOCK_QUICK_START_ITEMS: QuickStartItem[] = [
  {
    iconName: 'history',
    iconColorClass: 'text-blue-400',
    title: '復習する',
    badge: { text: 'AIのおすすめ', colorClass: 'bg-green-500' },
    href: '/learn/review',
  },
  {
    iconName: 'school',
    iconColorClass: 'text-orange-400',
    title: '新しい単元へ',
    href: '/learn-top',
  },
  {
    iconName: 'quiz',
    iconColorClass: 'text-purple-400',
    title: 'テスト対策',
    badge: { text: '人気', colorClass: 'bg-red-500' },
    href: '/challenges/test-prep',
  },
  {
    iconName: 'lightbulb',
    iconColorClass: 'text-teal-400',
    title: '苦手克服',
    href: '/learn/weakness',
  },
];

const MOCK_CHALLENGES: Challenge[] = [
    {
        iconName: 'flame',
        badge: 'あと3日で終了！',
        title: '連続学習マスター',
        description: '7日間連続で学習を完了させよう！',
        progress: 70,
        progressText: '東大志望者の80%が挑戦中',
        gradientClass: 'from-blue-500 to-indigo-600',
        shadowClass: 'hover:shadow-blue-500/50',
        href: '/challenges/1'
    },
    {
        iconName: 'star',
        badge: 'NEW',
        title: 'パーフェクトデイ',
        description: '1日の全ミッションを100%でクリア',
        progress: 10,
        progressText: '最高の集中力を証明しよう',
        gradientClass: 'from-orange-500 to-red-600',
        shadowClass: 'hover:shadow-orange-500/50',
        href: '/challenges/2'
    },
    {
        iconName: 'rocket',
        title: 'スピードランナー',
        description: '推奨時間の半分でタスクを完了',
        progress: 45,
        progressText: '京大志望者の65%が挑戦中',
        gradientClass: 'from-teal-500 to-green-600',
        shadowClass: 'hover:shadow-teal-500/50',
        href: '/challenges/3'
    }
];

export default function HomePage() {
  const [isFocusModalOpen, setFocusModalOpen] = useState(false);

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-900 text-white">
        <DashboardHeader userName={MOCK_USER_NAME} hasNotifications={MOCK_HAS_NOTIFICATIONS} />

        <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-8">
            <StudyFocusCard {...MOCK_STUDY_FOCUS_CARD_PROPS} />

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                <FocusGraph onClick={() => setFocusModalOpen(true)} />
                <QuickStart items={MOCK_QUICK_START_ITEMS} />
            </div>

            <div className="w-full">
              <ChallengesCarousel challenges={MOCK_CHALLENGES} />
            </div>
        </div>

        <FocusModal isOpen={isFocusModalOpen} onClose={() => setFocusModalOpen(false)} />
    </div>
  );
}
