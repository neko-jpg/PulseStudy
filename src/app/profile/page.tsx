
'use client';

import Link from 'next/link';
import {
  Home,
  BookOpen,
  Target,
  Users,
  BarChart,
  User,
  Flame,
  Clock,
  Award,
  Settings,
  Bell,
  Eye,
  Lock,
  Database,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  AlertTriangle,
  Book,
  Code,
  FlaskConical,
  Globe,
  Landmark,
  Calculator,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import './profile.css';

export default function ProfilePage() {
  return (
    <>
      <div className="profile-container">
        <header className="profile-header">
          <div className="profile-avatar">A</div>
          <h1 className="profile-name">葵さん</h1>
          <p className="profile-bio">高校2年・共通テスト志望</p>
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-value">7日</div>
              <div className="stat-label">連続学習</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">42時間</div>
              <div className="stat-label">総学習時間</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">1,250</div>
              <div className="stat-label">ポイント</div>
            </div>
          </div>
        </header>

        <div className="container-inner">
          <section className="settings-section">
            <div className="section-header">
              <h2 className="section-title">プロフィール設定</h2>
            </div>
            <div className="setting-item">
              <label htmlFor="display-name" className="setting-name">
                表示名
              </label>
              <input
                id="display-name"
                type="text"
                className="setting-input"
                defaultValue="葵さん"
              />
            </div>
            <div className="setting-item">
              <label htmlFor="grade-select" className="setting-name">
                学年
              </label>
              <select
                id="grade-select"
                className="setting-select"
                defaultValue="高校2年"
              >
                <option>中学1年</option>
                <option>中学2年</option>
                <option>中学3年</option>
                <option>高校1年</option>
                <option>高校2年</option>
                <option>高校3年</option>
                <option>大学生</option>
                <option>社会人</option>
              </select>
            </div>
            <div className="setting-item">
              <label htmlFor="goal-select" className="setting-name">
                学習目標
              </label>
              <select
                id="goal-select"
                className="setting-select"
                defaultValue="45分"
              >
                <option>15分</option>
                <option>30分</option>
                <option>45分</option>
                <option>1時間</option>
                <option>1.5時間</option>
                <option>2時間</option>
              </select>
            </div>
          </section>

          <section className="settings-section">
            <div className="section-header">
              <h2 className="section-title">通知設定</h2>
            </div>
            <div className="setting-item">
              <span className="setting-name">学習リマインダー</span>
              <Switch defaultChecked />
            </div>
            <div className="setting-item">
              <span className="setting-name">チャレンジ通知</span>
              <Switch defaultChecked />
            </div>
            <div className="setting-item">
              <span className="setting-name">フレンド活動</span>
              <Switch defaultChecked />
            </div>
          </section>

          <section className="settings-section">
            <div className="section-header">
              <h2 className="section-title">バッジと実績</h2>
              <Link href="#" className="section-link">
                すべて見る
              </Link>
            </div>
            <div className="badge-container">
              <div className="badge-item">
                <Flame />
              </div>
              <div className="badge-item">
                <Clock />
              </div>
              <div className="badge-item">
                <Award />
              </div>
              <div className="badge-item locked">
                <Lock />
              </div>
              <div className="badge-item locked">
                <Lock />
              </div>
              <div className="badge-item locked">
                <Lock />
              </div>
            </div>
          </section>

          <section className="danger-zone">
            <h2 className="danger-header">
              <AlertTriangle size={20} />
              危険ゾーン
            </h2>
            <Button variant="destructive" className="w-full justify-between">
              アカウントを削除
              <ChevronRight />
            </Button>
          </section>
        </div>
      </div>
      <nav className="bottom-nav">
        <Link href="/home" className="nav-item">
          <Home className="nav-icon" />
          <span>ホーム</span>
        </Link>
        <Link href="/learn" className="nav-item">
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
        <Link href="/profile" className="nav-item active">
          <User className="nav-icon" />
          <span>プロフィール</span>
        </Link>
      </nav>
    </>
  );
}
