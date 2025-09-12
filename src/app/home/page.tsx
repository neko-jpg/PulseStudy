'use client'

import { useState, useEffect } from 'react'
import { DashboardHeader } from '@/components/dashboard/Header'
import { StudyFocusCard } from '@/components/dashboard/StudyFocusCard'
import { FocusGraph } from '@/components/dashboard/FocusGraph'
import { QuickStart, type QuickStartItem } from '@/components/dashboard/QuickStart'
import { ChallengesCarousel, type Challenge } from '@/components/dashboard/ChallengesCarousel'
import { FocusModal } from '@/components/dashboard/FocusModal'
import './new-home.css'
import { Skeleton } from '@/components/ui/skeleton'

// Mock data for components that are not part of this task
const MOCK_USER_NAME = '葵'
const MOCK_HAS_NOTIFICATIONS = true

const MOCK_CHALLENGES: Challenge[] = [
  {
    iconName: 'flame',
    badge: 'あと3日で終了',
    title: '連続学習マスター',
    description: '7日間連続で学習を完了させよう',
    progress: 70,
    progressText: '東大志望者の80%が挑戦中',
    gradientClass: 'from-blue-500 to-indigo-600',
    shadowClass: 'hover:shadow-blue-500/50',
    href: '/challenges/1',
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
    href: '/challenges/2',
  },
]

interface Recommendation {
  aiCommand: string
  taskTitle: string
  taskUrl: string
}

export default function HomePage() {
  const [isFocusModalOpen, setFocusModalOpen] = useState(false)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [quickStartItems, setQuickStartItems] = useState<QuickStartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAllData() {
      setIsLoading(true)
      try {
        // AI learning path
        const recResponse = await fetch('/api/ai/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goals: '次のテストで90点以上取る' }),
        })
        if (!recResponse.ok) throw new Error('Failed to fetch recommendation')
        const recData = await recResponse.json()
        const learningPath = recData.learningPath || ''
        const firstLine = learningPath.split('\n')[0].replace(/^- /, '').replace(/\*/g, '')
        setRecommendation({
          aiCommand: learningPath,
          taskTitle: firstLine || 'AIのおすすめ学習',
          taskUrl: '/learn-top',
        })

        // AI review schedule
        const reviewResponse = await fetch('/api/ai/review-schedule')
        if (!reviewResponse.ok) throw new Error('Failed to fetch review schedule')
        const reviewData = await reviewResponse.json()
        const firstReviewSubject = reviewData.scheduledQuestions?.[0]?.subject || 'math-quad-1'

        // Dynamic QuickStart items
        const dynamicQuickStartItems: QuickStartItem[] = [
          {
            iconName: 'history',
            iconColorClass: 'text-blue-400',
            title: '復習する',
            badge: { text: 'AIのおすすめ', colorClass: 'bg-green-500' },
            href: `/learn/${firstReviewSubject}/summary`,
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
            title: '苦手を克服',
            href: `/learn/${firstReviewSubject}/summary`,
          },
        ]
        setQuickStartItems(dynamicQuickStartItems)
      } catch (error) {
        console.error(error)
        setRecommendation({
          aiCommand: 'AIからの提案の取得に失敗しました',
          taskTitle: '新しい単元を学習する',
          taskUrl: '/learn-top',
        })
        setQuickStartItems([
          { iconName: 'history', title: '復習する', href: '/learn/review', iconColorClass: 'text-blue-400' },
          { iconName: 'school', title: '新しい単元へ', href: '/learn-top', iconColorClass: 'text-orange-400' },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [])

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
  )
}
