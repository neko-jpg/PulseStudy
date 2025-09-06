
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Check,
  Settings,
  BookOpen,
  Target,
  Users,
  GitMerge,
  Home,
  BarChart,
  User,
  Mail,
  ChevronRight,
} from 'lucide-react';
import './notifications.css';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    // In a real app, you would filter the notifications here
  };

  return (
    <>
      <div className="notifications-container">
        <header className="notifications-header">
          <div className="header-top">
            <Link href="/home" className="text-white">
              <ChevronRight className="rotate-180" />
            </Link>
            <div className="unread-count">
              <Mail size={16} />
              <span className="count-number">5件の未読</span>
            </div>
            <div className="header-actions">
              <button className="header-button">
                <Check size={18} />
              </button>
              <Link href="/profile" className="header-button">
                <Settings size={18} />
              </Link>
            </div>
          </div>
          <h1 className="notifications-title">通知 & 受信箱</h1>
          <p className="notifications-subtitle">最新の更新とメッセージ</p>
        </header>

        <div className="container-inner">
          <div className="tabs-navigation">
            <button
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => handleTabClick('all')}
            >
              すべて
            </button>
            <button
              className={`tab-button ${activeTab === 'unread' ? 'active' : ''}`}
              onClick={() => handleTabClick('unread')}
            >
              未読
            </button>
            <button
              className={`tab-button ${
                activeTab === 'learning' ? 'active' : ''
              }`}
              onClick={() => handleTabClick('learning')}
            >
              学習
            </button>
            <button
              className={`tab-button ${
                activeTab === 'social' ? 'active' : ''
              }`}
              onClick={() => handleTabClick('social')}
            >
              ソーシャル
            </button>
            <button
              className={`tab-button ${
                activeTab === 'system' ? 'active' : ''
              }`}
              onClick={() => handleTabClick('system')}
            >
              システム
            </button>
          </div>

          <div className="notifications-list">
            <div className="notification-item unread">
              <div className="notification-icon icon-learning">
                <BookOpen size={20} />
              </div>
              <div className="notification-content">
                <div className="notification-title">
                  <span>学習リマインダー</span>
                  <span className="notification-badge badge-new">New</span>
                </div>
                <p className="notification-text">
                  今日の学習目標まであと15分です。数学の二次関数を続けましょう。
                </p>
                <div className="notification-meta">
                  <div className="notification-time">10分前</div>
                  <div className="notification-actions">
                    <button className="action-button button-primary">
                      学習する
                    </button>
                  </div>
                </div>
              </div>
              <div className="notification-mark"></div>
            </div>

            <div className="notification-item unread">
              <div className="notification-icon icon-challenge">
                <Target size={20} />
              </div>
              <div className="notification-content">
                <div className="notification-title">
                  <span>新しいチャレンジ</span>
                </div>
                <p className="notification-text">
                  「5日連続学習」チャレンジが利用可能です。報酬: 150ポイント
                </p>
                <div className="notification-meta">
                  <div className="notification-time">1時間前</div>
                  <div className="notification-actions">
                    <button className="action-button button-primary">
                      確認
                    </button>
                  </div>
                </div>
              </div>
              <div className="notification-mark"></div>
            </div>

            <div className="notification-item unread">
              <div className="notification-icon icon-teacher">
                <User size={20} />
              </div>
              <div className="notification-content">
                <div className="notification-title">
                  <span>佐藤先生からのメッセージ</span>
                  <span className="notification-badge badge-urgent">重要</span>
                </div>
                <p className="notification-text">
                  二次関数の課題の提出期限が明日に迫っています。まだ提出されていません。
                </p>
                <div className="notification-meta">
                  <div className="notification-time">2時間前</div>
                  <div className="notification-actions">
                    <button className="action-button button-primary">
                      課題を見る
                    </button>
                  </div>
                </div>
              </div>
              <div className="notification-mark"></div>
            </div>

            <div className="notification-item">
              <div className="notification-icon icon-social">
                <Users size={20} />
              </div>
              <div className="notification-content">
                <div className="notification-title">
                  <span>新しいフレンドリクエスト</span>
                </div>
                <p className="notification-text">
                  健太さんがあなたをフレンドに追加したいようです。
                </p>
                <div className="notification-meta">
                  <div className="notification-time">5時間前</div>
                  <div className="notification-actions">
                    <button className="action-button button-primary">
                      承認
                    </button>
                    <button className="action-button button-secondary">
                      拒否
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="notification-item">
              <div className="notification-icon icon-system">
                <GitMerge size={20} />
              </div>
              <div className="notification-content">
                <div className="notification-title">
                  <span>システム更新</span>
                </div>
                <p className="notification-text">
                  新バージョンが利用可能です。新しい機能と改善点が含まれています。
                </p>
                <div className="notification-meta">
                  <div className="notification-time">1日前</div>
                  <div className="notification-actions">
                    <button className="action-button button-primary">
                      更新
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
        <Link href="/challenge" className="nav-item">
          <Target className="nav-icon" />
          <span>チャレンジ</span>
        </Link>
        <Link href="/collab" className="nav-item">
          <Users className="nav-icon" />
          <span>コラボ</span>
        </Link>
        <Link href="/analytics" className="nav-item">
          <BarChart className="nav-icon" />
          <span>分析</span>
        </Link>
        <Link href="/profile" className="nav-item">
          <User className="nav-icon" />
          <span>プロフィール</span>
        </Link>
      </nav>
    </>
  );
}
