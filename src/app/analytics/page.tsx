
'use client';

import Link from 'next/link';
import {
  ArrowUp,
  ArrowDown,
  Flame,
  BarChart,
  Clock,
  TrendingUp,
  Target,
  Plus,
  Mail,
  User,
  Camera,
  Download,
  Home,
  BookOpen,
  Users,
} from 'lucide-react';
import './analytics.css';

export default function AnalyticsPage() {
  return (
    <>
      <div className="analytics-container">
        <header className="analytics-header">
          <div className="header-top">
            <h1>学習分析</h1>
            <div className="period-selector">
              <button className="period-button active">週</button>
              <button className="period-button">月</button>
              <button className="period-button">全期間</button>
            </div>
          </div>
          <div className="analytics-title">学習の成果を確認しよう</div>
          <div className="analytics-subtitle">今週は7時間学習しました</div>
        </header>

        <div className="container-inner">
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-title">学習時間</div>
              <div className="card-value">7h 30m</div>
              <div className="card-change positive">
                <ArrowUp size={14} /> 12% 先週より増加
              </div>
            </div>
            <div className="summary-card">
              <div className="card-title">集中度</div>
              <div className="card-value">76%</div>
              <div className="card-change positive">
                <ArrowUp size={14} /> 5% 先週より向上
              </div>
            </div>
            <div className="summary-card">
              <div className="card-title">正答率</div>
              <div className="card-value">82%</div>
              <div className="card-change negative">
                <ArrowDown size={14} /> 3% 微減
              </div>
            </div>
            <div className="summary-card">
              <div className="card-title">連続学習</div>
              <div className="card-value">7日</div>
              <div className="card-change positive">
                <Flame size={14} /> 継続中
              </div>
            </div>
          </div>

          <section className="heatmap-section">
            <div className="section-header">
              <div className="section-title">学習活動ヒートマップ</div>
            </div>
            <div className="heatmap-container">
              <div className="heatmap-day">月</div>
              <div className="heatmap-day">火</div>
              <div className="heatmap-day">水</div>
              <div className="heatmap-day">木</div>
              <div className="heatmap-day">金</div>
              <div className="heatmap-day">土</div>
              <div className="heatmap-day">日</div>

              <div className="heatmap-cell" data-level="2">
                <div className="heatmap-tooltip">月曜: 1.5時間</div>
              </div>
              <div className="heatmap-cell" data-level="3">
                <div className="heatmap-tooltip">火曜: 2時間</div>
              </div>
              <div className="heatmap-cell" data-level="1">
                <div className="heatmap-tooltip">水曜: 45分</div>
              </div>
              <div className="heatmap-cell" data-level="4">
                <div className="heatmap-tooltip">木曜: 2.5時間</div>
              </div>
              <div className="heatmap-cell" data-level="2">
                <div className="heatmap-tooltip">金曜: 1.5時間</div>
              </div>
              <div className="heatmap-cell" data-level="0">
                <div className="heatmap-tooltip">土曜: 学習なし</div>
              </div>
              <div className="heatmap-cell" data-level="1">
                <div className="heatmap-tooltip">日曜: 30分</div>
              </div>
            </div>
          </section>

          <section className="focus-section">
            <div className="section-header">
              <div className="section-title">時間帯別集中度</div>
            </div>
            <div className="chart-container">
              <div className="chart-line">
                <div className="chart-bar" style={{ height: '65%' }}></div>
                <div className="chart-bar" style={{ height: '45%' }}></div>
                <div className="chart-bar" style={{ height: '30%' }}></div>
                <div className="chart-bar" style={{ height: '75%' }}></div>
                <div className="chart-bar" style={{ height: '90%' }}></div>
                <div className="chart-bar" style={{ height: '70%' }}></div>
                <div className="chart-bar" style={{ height: '40%' }}></div>
              </div>
            </div>
            <div className="chart-labels">
              <span>6-9時</span>
              <span>9-12時</span>
              <span>12-15時</span>
              <span>15-18時</span>
              <span>18-21時</span>
              <span>21-24時</span>
              <span>0-6時</span>
            </div>
          </section>

          <section className="subjects-section">
            <div className="section-header">
              <div className="section-title">科目別理解度</div>
            </div>
            <div className="subject-row">
              <div className="subject-name">数学</div>
              <div className="subject-progress">
                <div
                  className="subject-progress-fill"
                  style={{ width: '75%', backgroundColor: 'var(--primary)' }}
                ></div>
              </div>
              <div className="subject-percentage">75%</div>
            </div>
            <div className="subject-row">
              <div className="subject-name">英語</div>
              <div className="subject-progress">
                <div
                  className="subject-progress-fill"
                  style={{ width: '82%', backgroundColor: 'var(--success)' }}
                ></div>
              </div>
              <div className="subject-percentage">82%</div>
            </div>
            <div className="subject-row">
              <div className="subject-name">国語</div>
              <div className="subject-progress">
                <div
                  className="subject-progress-fill"
                  style={{ width: '68%', backgroundColor: 'var(--warning)' }}
                ></div>
              </div>
              <div className="subject-percentage">68%</div>
            </div>
            <div className="subject-row">
              <div className="subject-name">理科</div>
              <div className="subject-progress">
                <div
                  className="subject-progress-fill"
                  style={{ width: '60%', backgroundColor: 'var(--accent)' }}
                ></div>
              </div>
              <div className="subject-percentage">60%</div>
            </div>
          </section>

          <section className="improvement-section">
            <div className="section-header">
              <div className="section-title">改善ポイント</div>
            </div>
            <div className="improvement-card">
              <div className="improvement-title">
                <BarChart size={18} />
                <span>二次関数の強化</span>
              </div>
              <div className="improvement-desc">
                先週の正答率が65%と低めです。グラフ問題に重点的に取り組みましょう。
              </div>
              <button className="improvement-action">強化学習を開始</button>
            </div>
            <div className="improvement-card">
              <div className="improvement-title">
                <Clock size={18} />
                <span>朝の学習習慣化</span>
              </div>
              <div className="improvement-desc">
                朝6-9時の集中度が最高です。この時間帯の学習を増やしましょう。
              </div>
              <button className="improvement-action">スケジュール設定</button>
            </div>
          </section>

          <section className="schedule-section">
            <div className="section-header">
              <div className="section-title">今週の学習提案</div>
            </div>
            <div className="schedule-days">
              <div className="schedule-day active">月</div>
              <div className="schedule-day">火</div>
              <div className="schedule-day">水</div>
              <div className="schedule-day">木</div>
              <div className="schedule-day">金</div>
              <div className="schedule-day">土</div>
              <div className="schedule-day">日</div>
            </div>
            <div className="schedule-slots">
              <div className="schedule-slot">
                <div className="slot-time">18:00-18:30</div>
                <div className="slot-subject">数学：二次関数の復習</div>
                <button className="slot-action">
                  <Plus size={16} />
                </button>
              </div>
              <div className="schedule-slot">
                <div className="slot-time">20:00-20:30</div>
                <div className="slot-subject">英語：不定詞の演習</div>
                <button className="slot-action">
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <button
              className="improvement-action"
              style={{ width: '100%', marginTop: '16px' }}
            >
              カレンダーに追加
            </button>
          </section>

          <section className="share-section">
            <div className="section-header">
              <div className="section-title">進捗を共有</div>
            </div>
            <div className="share-options">
              <button className="share-button">
                <Mail className="share-icon" />
                <div className="share-text">保護者に送信</div>
              </button>
              <button className="share-button">
                <User className="share-icon" />
                <div className="share-text">教師と共有</div>
              </button>
              <button className="share-button">
                <Camera className="share-icon" />
                <div className="share-text">画像で保存</div>
              </button>
              <button className="share-button">
                <Download className="share-icon" />
                <div className="share-text">データ出力</div>
              </button>
            </div>
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
        <Link href="/challenge" className="nav-item">
          <Target className="nav-icon" />
          <span>チャレンジ</span>
        </Link>
        <Link href="/collab" className="nav-item">
          <Users className="nav-icon" />
          <span>コラボ</span>
        </Link>
        <Link href="/analytics" className="nav-item active">
          <BarChart className="nav-icon" />
          <span>分析</span>
        </Link>
      </nav>
    </>
  );
}
