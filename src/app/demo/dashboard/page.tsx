"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startSession } from '@/lib/session';
import { Bell, Bolt, BookOpen, Users, BarChart3, Home, School, Trophy, MessageCircleQuestion, Lightbulb, Rocket, Clock, Play } from 'lucide-react';

function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900/70 backdrop-blur-sm p-6 flex flex-col justify-between border-r border-slate-800">
      <div>
        <div className="flex items-center mb-10">
          <h1 className="text-2xl font-bold text-white">PulseStudy</h1>
          <Bolt className="ml-2 text-blue-400" />
        </div>
        <nav className="space-y-2">
          <Link href="/home" className="flex items-center px-4 py-3 bg-slate-800 rounded-lg text-white">
            <Home className="mr-3" />
            <span className="font-semibold">ホーム</span>
          </Link>
          <Link href="/learn-top" className="flex items-center px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg">
            <BookOpen className="mr-3" />
            <span className="font-semibold">学習</span>
          </Link>
          <Link href="/challenges" className="flex items-center px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg">
            <Trophy className="mr-3" />
            <span className="font-semibold">チャレンジ</span>
          </Link>
          <Link href="/collab" className="flex items-center px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg">
            <Users className="mr-3" />
            <span className="font-semibold">コラボ</span>
          </Link>
          <Link href="/analytics" className="flex items-center px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg">
            <BarChart3 className="mr-3" />
            <span className="font-semibold">分析</span>
          </Link>
        </nav>
      </div>
      <div className="space-y-2">
        <Link href="/profile" className="flex items-center px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg">
          <Users className="mr-3" />
          <span className="font-semibold">プロフィール</span>
        </Link>
        <div className="w-full flex justify-center pt-4">
          <button className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center font-bold text-lg text-white">N</button>
        </div>
      </div>
    </aside>
  )
}

export default function DemoDashboardPage() {
  const router = useRouter();

  async function handleStart(moduleId: string) {
    try {
      const data = await startSession({ moduleId });
      router.push(`/learn/${data.moduleId}/summary`);
    } catch {
      router.push(`/learn/${moduleId}/summary`);
    }
  }

  return (
    <div className="bg-slate-900 text-white flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <p className="text-xl text-slate-400">こんばんは、葵さん。</p>
            <p className="text-2xl font-bold text-white">昨日の集中、見事でした！</p>
          </div>
          <div className="relative">
            <Bell className="text-3xl text-slate-400 hover:text-white cursor-pointer" />
            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-slate-900"></span>
          </div>
        </header>

        <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-8">
          <div className="w-full bg-slate-800/50 backdrop-blur-lg rounded-3xl border border-slate-700 p-8 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <div className="flex items-start mb-6">
              <Bolt className="text-4xl text-blue-400 mr-4" />
              <div className="bg-slate-700 rounded-lg p-4 text-slate-300 relative">
                <div className="absolute -left-2 top-4 w-4 h-4 bg-slate-700 transform rotate-45"></div>
                AIからの今日の司令: 苦手分野を克服し、自信をつけましょう！
              </div>
            </div>
            <h2 className="text-5xl font-black text-white mb-4">不定詞の基礎を理解</h2>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4 text-slate-300">
                <div className="flex items-center"><Bolt className="mr-2 text-green-400" /><span className="font-bold text-lg text-white">15 FP</span></div>
                <div className="flex items-center"><Clock className="mr-2 text-blue-400" /><span className="text-lg">5分</span></div>
                <div className="flex items-center"><MessageCircleQuestion className="mr-2 text-orange-400" /><span className="text-lg">4問</span></div>
              </div>
              <div className="w-1/3">
                <div className="h-3 bg-slate-700 rounded-full">
                  <div className="h-3 bg-blue-500 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>
            <button onClick={() => handleStart('eng-infinitive-1')} className="w-full py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-2xl font-bold rounded-xl shadow-lg hover:-translate-y-0.5 transition flex items-center justify-center">
              <Play className="mr-2" />
              学習を始める
            </button>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 p-6">
              <h3 className="text-xl font-bold mb-4 text-white">没入度グラフ</h3>
              <div className="h-64 flex items-center justify-center flex-col text-center">
                <div className="relative w-full h-full flex items-end justify-center">
                  <svg className="w-full h-full absolute" viewBox="0 0 300 150">
                    <defs>
                      <linearGradient id="glow" x1="0" x2="0" y1="0" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5"></stop>
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"></stop>
                      </linearGradient>
                    </defs>
                    <path d="M 0 120 C 40 100, 60 40, 100 80 S 160 140, 200 100 S 260 20, 300 50" fill="url(#glow)" stroke="none"></path>
                    <path className="drop-shadow-[0_0_8px_#f59e0b]" d="M 0 120 C 40 100, 60 40, 100 80 S 160 140, 200 100 S 260 20, 300 50" fill="none" stroke="#f59e0b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl border border-slate-700 p-6">
              <h3 className="text-xl font-bold mb-4 text-white">クイックスタート</h3>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => handleStart('math-quad-1')} className="relative bg-slate-700 hover:bg-slate-600 rounded-lg p-4 text-center transition-colors">
                  <HistoryIcon className="text-4xl text-blue-400 mb-2" />
                  <p className="font-semibold text-white">復習する</p>
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">AIのおすすめ</span>
                </button>
                <button onClick={() => handleStart('eng-infinitive-1')} className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 text-center transition-colors">
                  <School className="text-4xl text-orange-400 mb-2" />
                  <p className="font-semibold text-white">新しい単元へ</p>
                </button>
                <button onClick={() => handleStart('en-irregs')} className="relative bg-slate-700 hover:bg-slate-600 rounded-lg p-4 text-center transition-colors">
                  <MessageCircleQuestion className="text-4xl text-purple-400 mb-2" />
                  <p className="font-semibold text-white">テスト対策</p>
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">人気</span>
                </button>
                <button onClick={() => handleStart('math-quad-1')} className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 text-center transition-colors">
                  <Lightbulb className="text-4xl text-teal-400 mb-2" />
                  <p className="font-semibold text-white">苦手克服</p>
                </button>
              </div>
            </div>
          </div>

          <div className="w-full">
            <h3 className="text-2xl font-bold mb-4 text-white">チャレンジ</h3>
            <div className="flex space-x-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex-shrink-0 w-72 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 flex flex-col justify-between shadow-lg hover:shadow-blue-500/50 transition-shadow">
                <div>
                  <div className="flex justify-between items-start">
                    <FlameIcon className="text-5xl text-white opacity-80" />
                    <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">あと3日で終了！</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mt-4">連続学習マスター</h4>
                  <p className="text-white/80 mt-1">7日間連続で学習を完了させよう！</p>
                </div>
                <div>
                  <div className="w-full bg-white/30 rounded-full h-2.5 mt-4">
                    <div className="bg-white rounded-full h-2.5" style={{ width: '70%' }}></div>
                  </div>
                  <p className="text-sm text-white/80 mt-2">東大志望者の80%が挑戦中</p>
                </div>
              </div>
              <div className="flex-shrink-0 w-72 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 flex flex-col justify-between shadow-lg hover:shadow-orange-500/50 transition-shadow">
                <div>
                  <div className="flex justify-between items-start">
                    <StarIcon className="text-5xl text-white opacity-80" />
                    <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">NEW</span>
                  </div>
                  <h4 className="text-xl font-bold text-white mt-4">パーフェクトデイ</h4>
                  <p className="text-white/80 mt-1">1日の全ミッションを100%でクリア</p>
                </div>
                <div>
                  <div className="w-full bg-white/30 rounded-full h-2.5 mt-4">
                    <div className="bg-white rounded-full h-2.5" style={{ width: '10%' }}></div>
                  </div>
                  <p className="text-sm text-white/80 mt-2">最高の集中力を証明しよう</p>
                </div>
              </div>
              <div className="flex-shrink-0 w-72 bg-gradient-to-br from-teal-500 to-green-600 rounded-xl p-6 flex flex-col justify-between shadow-lg hover:shadow-teal-500/50 transition-shadow">
                <div>
                  <div className="flex justify-between items-start">
                    <Rocket className="text-5xl text-white opacity-80" />
                  </div>
                  <h4 className="text-xl font-bold text-white mt-4">スピードランナー</h4>
                  <p className="text-white/80 mt-1">推奨時間の半分でタスクを完成</p>
                </div>
                <div>
                  <div className="w-full bg-white/30 rounded-full h-2.5 mt-4">
                    <div className="bg-white rounded-full h-2.5" style={{ width: '45%' }}></div>
                  </div>
                  <p className="text-sm text-white/80 mt-2">京大志望者の65%が挑戦中</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg className="mr-3 text-3xl" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
  )
}
function HistoryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3a9 9 0 1 0 8.95 8H20a7 7 0 1 1-2.05-4.95L16 8h5V3l-1.64 1.64A8.96 8.96 0 0 0 13 3zm-1 5h2v5h4v2h-6z"/></svg>
  )
}
function FlameIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 0s2 2 2 5-2 4-2 4 6 1 6 7-4.5 8-9 8S2 20 2 15s3.5-7 6-9c0 0 0 2 2 2s3-2 3.5-8z"/></svg>
  )
}
function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
  )
}
