'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/Header';
import { StudyFocusCard } from '@/components/dashboard/StudyFocusCard';
import { FocusGraph } from '@/components/dashboard/FocusGraph';
import { QuickStart, type QuickStartItem } from '@/components/dashboard/QuickStart';
import { ChallengesCarousel, type Challenge } from '@/components/dashboard/ChallengesCarousel';
import { FocusModal } from '@/components/dashboard/FocusModal';
import './new-home.css';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for components that are not part of this task
const MOCK_USER_NAME = '闡ｵ';
const MOCK_HAS_NOTIFICATIONS = true;

const MOCK_CHALLENGES: Challenge[] = [
    {
        iconName: 'flame',
        badge: '縺ゅ→3譌･縺ｧ邨ゆｺ・ｼ・,
        title: '騾｣邯壼ｭｦ鄙偵・繧ｹ繧ｿ繝ｼ',
        description: '7譌･髢馴｣邯壹〒蟄ｦ鄙偵ｒ螳御ｺ・＆縺帙ｈ縺・ｼ・,
        progress: 70,
        progressText: '譚ｱ螟ｧ蠢玲悍閠・・80%縺梧倦謌ｦ荳ｭ',
        gradientClass: 'from-blue-500 to-indigo-600',
        shadowClass: 'hover:shadow-blue-500/50',
        href: '/challenges/1'
    },
    {
        iconName: 'star',
        badge: 'NEW',
        title: '繝代・繝輔ぉ繧ｯ繝医ョ繧､',
        description: '1譌･縺ｮ蜈ｨ繝溘ャ繧ｷ繝ｧ繝ｳ繧・00%縺ｧ繧ｯ繝ｪ繧｢',
        progress: 10,
        progressText: '譛鬮倥・髮・ｸｭ蜉帙ｒ險ｼ譏弱＠繧医≧',
        gradientClass: 'from-orange-500 to-red-600',
        shadowClass: 'hover:shadow-orange-500/50',
        href: '/challenges/2'
    },
];

interface Recommendation {
  aiCommand: string;
  taskTitle: string;
  taskUrl: string;
}

interface ReviewQuestion {
    subject: string;
    question: string;
    answer: string;
}

export default function HomePage() {
  const [isFocusModalOpen, setFocusModalOpen] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [quickStartItems, setQuickStartItems] = useState<QuickStartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData() {
      setIsLoading(true);
      try {
        // Fetch AI learning path
        const recResponse = await fetch('/api/ai/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goals: '谺｡縺ｮ繝・せ繝医〒90轤ｹ莉･荳雁叙繧・ }),
        });
        if (!recResponse.ok) throw new Error('Failed to fetch recommendation');
        const recData = await recResponse.json();
        const learningPath = recData.learningPath || '';
        const firstLine = learningPath.split('\n')[0].replace(/^- /, '').replace(/\*/g, '');
        setRecommendation({
          aiCommand: learningPath,
          taskTitle: firstLine || 'AI縺ｮ縺翫☆縺吶ａ蟄ｦ鄙・,
          taskUrl: '/learn-top',
        });

        // Fetch AI review schedule
        const reviewResponse = await fetch('/api/ai/review-schedule');
        if (!reviewResponse.ok) throw new Error('Failed to fetch review schedule');
        const reviewData = await reviewResponse.json();
        const firstReviewSubject = reviewData.scheduledQuestions?.[0]?.subject || 'math-quad-1';

        // Generate dynamic QuickStart items
        const dynamicQuickStartItems: QuickStartItem[] = [
          {
            iconName: 'history',
            iconColorClass: 'text-blue-400',
            title: '蠕ｩ鄙偵☆繧・,
            badge: { text: 'AI縺ｮ縺翫☆縺吶ａ', colorClass: 'bg-green-500' },
            href: `/learn/${firstReviewSubject}/summary`, // Dynamic link
          },
          {
            iconName: 'school',
            iconColorClass: 'text-orange-400',
            title: '譁ｰ縺励＞蜊伜・縺ｸ',
            href: '/learn-top',
          },
          {
            iconName: 'quiz',
            iconColorClass: 'text-purple-400',
            title: '繝・せ繝亥ｯｾ遲・,
            badge: { text: '莠ｺ豌・, colorClass: 'bg-red-500' },
            href: '/challenges/test-prep',
          },
          {
            iconName: 'lightbulb',
            iconColorClass: 'text-teal-400',
            title: '闍ｦ謇句・譛・,
            href: `/learn/${firstReviewSubject}/summary`, // Also point to the weak subject
          },
        ];
        setQuickStartItems(dynamicQuickStartItems);

      } catch (error) {
        console.error(error);
        // Set fallback data on error
        setRecommendation({
          aiCommand: 'AI縺九ｉ縺ｮ謠先｡医・蜿門ｾ励↓螟ｱ謨励＠縺ｾ縺励◆縲・,
          taskTitle: '譁ｰ縺励＞蜊伜・繧貞ｭｦ鄙偵☆繧・,
          taskUrl: '/learn-top',
        });
        setQuickStartItems([
          { iconName: 'history', title: '蠕ｩ鄙偵☆繧・, href: '/learn/review', iconColorClass: 'text-blue-400' },
          { iconName: 'school', title: '譁ｰ縺励＞蜊伜・縺ｸ', href: '/learn-top', iconColorClass: 'text-orange-400' }
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllData();
  }, []);

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-slate-900 text-white">
        <DashboardHeader userName={MOCK_USER_NAME} hasNotifications={MOCK_HAS_NOTIFICATIONS} />

        <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-8">
            {isLoading || !recommendation ? (
              <Skeleton className="h-[150px] w-full rounded-xl" />
            ) : (
              <StudyFocusCard
                aiCommand={recommendation.aiCommand}
                taskTitle={recommendation.taskTitle}
                focusPoints={15}
                durationMinutes={5}
                questionCount={4}
                progressPercentage={0}
                taskUrl={recommendation.taskUrl}
              />
            )}

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                <FocusGraph onClick={() => setFocusModalOpen(true)} />
                {quickStartItems.length > 0 ? (
                  <QuickStart items={quickStartItems} />
                ) : (
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                )}
            </div>

            <div className="w-full">
              <ChallengesCarousel challenges={MOCK_CHALLENGES} />
            </div>
        </div>

        <FocusModal isOpen={isFocusModalOpen} onClose={() => setFocusModalOpen(false)} />
    </div>
  );
}



