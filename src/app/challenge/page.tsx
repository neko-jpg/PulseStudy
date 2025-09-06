
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  Clock,
  Flame,
  BookOpen,
  Users,
  Trophy,
  Rocket,
  Check,
  Circle,
  Home,
  Target,
  BarChart,
} from 'lucide-react';
import './challenge.css';

export default function ChallengePage() {
  const [activeTab, setActiveTab] = useState('daily');
  const [showModal, setShowModal] = useState(false);
  const [points, setPoints] = useState(1250);

  const switchTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  const completeDailyChallenge = () => {
    setShowModal(true);
    setPoints(points + 100);
  };

  const closeRewardModal = () => {
    setShowModal(false);
  };

  const startQuest = (questTitle: string) => {
    alert(`「${questTitle}」を開始します！`);
  };

  return (
    <>
      <div className="challenge-container">
        <header className="challenges-header">
          <div className="header-top">
            <h1>チャレンジ & クエスト</h1>
            <div className="points-display">
              <Star className="text-yellow-300" />
              <span className="points-count">{points.toLocaleString()}</span>
            </div>
          </div>
          <div className="challenges-title">目標を達成して報酬を獲得</div>
          <div className="challenges-subtitle">
            毎日新しいチャレンジが登場します
          </div>
        </header>

        <div className="container-inner">
          <div className="tabs-navigation">
            <div
              className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
              onClick={() => switchTab('daily')}
            >
              デイリー
            </div>
            <div
              className={`tab-button ${activeTab === 'weekly' ? 'active' : ''}`}
              onClick={() => switchTab('weekly')}
            >
              ウィークリー
            </div>
            <div
              className={`tab-button ${activeTab === 'quests' ? 'active' : ''}`}
              onClick={() => switchTab('quests')}
            >
              クエスト
            </div>
          </div>

          {activeTab === 'daily' && (
            <section className="daily-challenge" id="daily-tab">
              <div className="daily-badge">デイリーチャレンジ</div>
              <div className="daily-header">
                <div className="daily-title">今日の目標</div>
                <div className="daily-timer">
                  <Clock className="h-4 w-4" />
                  <span>14:32:10</span>
                </div>
              </div>
              <div className="daily-progress">
                <div
                  className="daily-progress-fill"
                  style={{ width: '60%' }}
                ></div>
              </div>
              <div className="daily-tasks">
                <div className="daily-task">
                  <div className="task-checkbox checked">
                    <Check size={16} />
                  </div>
                  <div className="task-info">
                    <div className="task-name">3つの学習モジュールを完了</div>
                    <div className="task-reward">
                      <Star className="h-3 w-3" /> 50ポイント
                    </div>
                  </div>
                </div>
                <div className="daily-task">
                  <div className="task-checkbox">
                    <Check size={16} />
                  </div>
                  <div className="task-info">
                    <div className="task-name">連続学習ストリークを維持</div>
                    <div className="task-reward">
                      <Star className="h-3 w-3" /> 30ポイント
                    </div>
                  </div>
                </div>
                <div className="daily-task">
                  <div className="task-checkbox">
                    <Check size={16} />
                  </div>
                  <div className="task-info">
                    <div className="task-name">コラボルームに参加</div>
                    <div className="task-reward">
                      <Star className="h-3 w-3" /> 20ポイント
                    </div>
                  </div>
                </div>
              </div>
              <div className="daily-actions">
                <button className="action-button button-secondary">
                  あとで
                </button>
                <button
                  className="action-button button-primary"
                  onClick={completeDailyChallenge}
                >
                  挑戦する
                </button>
              </div>
            </section>
          )}

          {activeTab === 'weekly' && (
            <section className="weekly-section" id="weekly-tab">
              <div className="section-header">
                <div className="section-title">ウィークリーチャレンジ</div>
                <Link href="#" className="section-link">
                  すべて見る
                </Link>
              </div>
              <div className="challenge-cards">
                {/* Weekly Challenge Cards */}
              </div>
            </section>
          )}

          {activeTab === 'quests' && (
            <section className="quests-section" id="quests-tab">
              <div className="section-header">
                <div className="section-title">スペシャルクエスト</div>
                <Link href="#" className="section-link">
                  すべて見る
                </Link>
              </div>
              {/* Quest Cards */}
            </section>
          )}

          <section className="ranking-section">
            <div className="section-header">
              <div className="section-title">フレンドランキング</div>
              <Link href="#" className="section-link">
                全体ランキング
              </Link>
            </div>
            <div className="ranking-card">{/* Ranking content */}</div>
          </section>
        </div>
      </div>

      <nav className="bottom-nav">
        <Link href="/home" className="nav-item">
          <Home className="nav-icon" />
          <span>ホーム</span>
        </Link>
        <Link href="#" className="nav-item">
          <BookOpen className="nav-icon" />
          <span>学習</span>
        </Link>
        <Link href="/challenge" className="nav-item active">
          <Target className="nav-icon" />
          <span>チャレンジ</span>
        </Link>
        <Link href="/collab" className="nav-item">
          <Users className="nav-icon" />
          <span>コラボ</span>
        </Link>
        <Link href="#" className="nav-item">
          <BarChart className="nav-icon" />
          <span>分析</span>
        </Link>
      </nav>

      {showModal && (
        <div className="reward-modal show">
          <div className="modal-content">
            <div className="modal-icon">🎉</div>
            <div className="modal-title">チャレンジ達成！</div>
            <div className="modal-text">デイリーチャレンジを完了しました</div>
            <div className="modal-points">+100 ⭐</div>
            <button className="modal-button" onClick={closeRewardModal}>
              ポイントを受け取る
            </button>
          </div>
        </div>
      )}
    </>
  );
}
