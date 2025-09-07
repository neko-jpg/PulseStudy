'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Target, Zap, TestTube2, BookCopy, AlertTriangle, BarChart2 } from 'lucide-react';
import './learn-top.css';

export default function LearnTopPage() {
  const router = useRouter();

  const startLearning = (moduleId: string) => {
    router.push(`/learn?module=${moduleId}&source=learn-top`);
  };

  const openSubject = (subject: string) => {
    router.push(`/learn-top?subject=${encodeURIComponent(subject)}`);
  };

  const setLearningMode = (mode: string) => {
    console.log(`学習モード: ${mode}`);
  };

  const handleQuickAction = (action: string) => {
    router.push('/learn?module=quad-basic&source=learn-top');
  };

  return (
    <>
      <div className="learn-top-container">
        <header className="learn-header">
          <div className="header-top">
            <h1>学習を始めよう</h1>
            <div className="learning-stats">
              <BarChart2 size={16} />
              <span className="stats-number">今日: 25分</span>
            </div>
          </div>
          <div className="learn-title">何を学びますか？</div>
          <div className="learn-subtitle">AIがあなたに最適な学習を提案します</div>
        </header>

        <div className="container-inner">
          <div className="quick-access">
            <div className="quick-item" onClick={() => handleQuickAction('quick-5min')}>
              <div className="quick-icon"><Zap /></div>
              <div className="quick-name">5分クイック</div>
              <div className="quick-desc">短時間で集中</div>
            </div>
            <div className="quick-item" onClick={() => handleQuickAction('weakness')}>
              <div className="quick-icon"><Target /></div>
              <div className="quick-name">苦手克服</div>
              <div className="quick-desc">弱点を重点練習</div>
            </div>
            <div className="quick-item" onClick={() => handleQuickAction('exam')}>
              <div className="quick-icon"><TestTube2 /></div>
              <div className="quick-name">テスト対策</div>
              <div className="quick-desc">試験に向けて</div>
            </div>
            <div className="quick-item" onClick={() => handleQuickAction('review')}>
              <div className="quick-icon"><BookCopy /></div>
              <div className="quick-name">復習</div>
              <div className="quick-desc">記憶を定着</div>
            </div>
          </div>

          <section className="mode-section">
            <div className="section-header">
              <div className="section-title">学習モード</div>
            </div>
            <div className="mode-options">
              <div className="mode-card selected" onClick={() => setLearningMode('通常学習')}>
                <div className="mode-icon"><BookOpen /></div>
                <div className="mode-name">通常学習</div>
              </div>
              <div className="mode-card" onClick={() => setLearningMode('集中モード')}>
                <div className="mode-icon"><Zap /></div>
                <div className="mode-name">集中モード</div>
              </div>
            </div>
          </section>

          <section className="recommended-section">
            <div className="section-header">
              <div className="section-title">AIおすすめ</div>
              <Link href="#" className="section-link">すべて見る</Link>
            </div>
            <div className="recommended-cards">
              <div className="recommended-card">
                <div className="recommended-badge badge-ai">AI推薦</div>
                <div className="card-subject">数学</div>
                <div className="card-title">二次関数のグラフ徹底解説</div>
                <div className="card-meta">
                  <div className="card-duration">⏱️ 5分</div>
                  <div className="card-difficulty difficulty-medium">標準</div>
                </div>
                <button className="card-button" onClick={() => startLearning('math-graph')}>開始</button>
              </div>
              <div className="recommended-card">
                <div className="recommended-badge badge-popular">人気</div>
                <div className="card-subject">英語</div>
                <div className="card-title">不定詞の使い方マスター</div>
                <div className="card-meta">
                  <div className="card-duration">⏱️ 5分</div>
                  <div className="card-difficulty difficulty-easy">基礎</div>
                </div>
                <button className="card-button" onClick={() => startLearning('english-infinitive')}>開始</button>
              </div>
            </div>
          </section>

          <section className="weakness-section">
            <div className="section-header">
              <div className="section-title">苦手単元の克服</div>
              <Link href="/analytics" className="section-link">分析を見る</Link>
            </div>
            <div className="weakness-list">
              <div className="weakness-item">
                <div className="weakness-icon"><AlertTriangle /></div>
                <div className="weakness-info">
                  <div className="weakness-name">三角比の応用</div>
                  <div className="weakness-desc">正答率: 45% • 最終学習 3日前</div>
                </div>
                <button className="weakness-action" onClick={() => startLearning('trigonometry')}>強化</button>
              </div>
              <div className="weakness-item">
                <div className="weakness-icon"><AlertTriangle /></div>
                <div className="weakness-info">
                  <div className="weakness-name">関係代名詞</div>
                  <div className="weakness-desc">正答率: 52% • 最終学習 5日前</div>
                </div>
                <button className="weakness-action" onClick={() => startLearning('relative-pronoun')}>強化</button>
              </div>
            </div>
          </section>

          <section className="subjects-section">
            <div className="section-header">
              <div className="section-title">科目から選ぶ</div>
              <Link href="#" className="section-link">すべて見る</Link>
            </div>
            <div className="subjects-grid">
              <div className="subject-card" onClick={() => openSubject('math')}>
                <div className="subject-icon">🧮</div>
                <div className="subject-name">数学</div>
                <div className="subject-progress">
                  <div className="subject-progress-fill" style={{ width: '75%' }}></div>
                </div>
                <div className="subject-stats">24単元中18単元完了</div>
              </div>
              <div className="subject-card" onClick={() => openSubject('english')}>
                <div className="subject-icon">📘</div>
                <div className="subject-name">英語</div>
                <div className="subject-progress">
                  <div className="subject-progress-fill" style={{ width: '60%' }}></div>
                </div>
                <div className="subject-stats">20単元中12単元完了</div>
              </div>
              <div className="subject-card" onClick={() => openSubject('science')}>
                <div className="subject-icon">🧪</div>
                <div className="subject-name">理科</div>
                <div className="subject-progress">
                  <div className="subject-progress-fill" style={{ width: '40%' }}></div>
                </div>
                <div className="subject-stats">15単元中6単元完了</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
