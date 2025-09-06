
'use client';

import {
  BarChart2,
  Settings,
  FilePlus,
  Users,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import './teacher-dashboard.css';

export default function TeacherDashboardPage() {
  return (
    <>
      <div className="teacher-container">
        <header className="teacher-header">
          <div className="header-top">
            <div className="teacher-info">
              <div className="teacher-avatar">S</div>
              <div>
                <div className="teacher-name">佐藤先生</div>
                <div className="teacher-role">数学教師</div>
              </div>
            </div>
            <div className="header-actions">
              <button className="header-button">
                <Settings size={16} /> 設定
              </button>
            </div>
          </div>
          <div className="teacher-title">教師ダッシュボード</div>
          <div className="teacher-subtitle">2年B組の学習進捗を管理</div>
        </header>

        <div className="container-inner">
          <div className="quick-actions">
            <div className="action-card">
              <div className="action-icon">
                <FilePlus size={32} />
              </div>
              <div className="action-name">課題作成</div>
              <div className="action-desc">新しい課題を作成</div>
            </div>
            <div className="action-card">
              <div className="action-icon">
                <BarChart2 size={32} />
              </div>
              <div className="action-name">成績分析</div>
              <div className="action-desc">テスト結果を分析</div>
            </div>
            <div className="action-card">
              <div className="action-icon">
                <Users size={32} />
              </div>
              <div className="action-name">クラス管理</div>
              <div className="action-desc">生徒を追加・編集</div>
            </div>
            <div className="action-card">
              <div className="action-icon">
                <Calendar size={32} />
              </div>
              <div className="action-name">スケジュール</div>
              <div className="action-desc">授業計画を作成</div>
            </div>
          </div>

          <section className="overview-section">
            <div className="section-header">
              <div className="section-title">クラス概要</div>
              <div className="section-link">すべて表示</div>
            </div>
            <div className="class-cards">
              <div className="class-card">
                <div className="class-name">2年B組</div>
                <div className="class-stats">
                  <span>32名</span>
                  <span>78% 参加率</span>
                </div>
              </div>
              <div className="class-card">
                <div className="class-name">3年A組</div>
                <div className="class-stats">
                  <span>28名</span>
                  <span>85% 参加率</span>
                </div>
              </div>
            </div>
          </section>

          <section className="progress-section">
            <div className="section-header">
              <div className="section-title">生徒進捗</div>
              <div className="section-link">詳細を見る</div>
            </div>
            <div className="students-list">
              <div className="student-item">
                <div className="student-avatar">A</div>
                <div className="student-info">
                  <div className="student-name">葵さん</div>
                  <div className="student-progress">
                    <div
                      className="student-progress-fill"
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                  <div className="student-meta">
                    <span>数学: 75%</span>
                    <span>7時間</span>
                  </div>
                </div>
                <button className="student-action">
                  <MessageSquare size={16} />
                </button>
              </div>
              <div className="student-item">
                <div className="student-avatar">K</div>
                <div className="student-info">
                  <div className="student-name">健太さん</div>
                  <div className="student-progress">
                    <div
                      className="student-progress-fill"
                      style={{ width: '90%' }}
                    ></div>
                  </div>
                  <div className="student-meta">
                    <span>数学: 90%</span>
                    <span>12時間</span>
                  </div>
                </div>
                <button className="student-action">
                  <MessageSquare size={16} />
                </button>
              </div>
              <div className="student-item">
                <div className="student-avatar">S</div>
                <div className="student-info">
                  <div className="student-name">さくらさん</div>
                  <div className="student-progress">
                    <div
                      className="student-progress-fill"
                      style={{ width: '45%' }}
                    ></div>
                  </div>
                  <div className="student-meta">
                    <span>数学: 45%</span>
                    <span>5時間</span>
                  </div>
                </div>
                <button className="student-action">
                  <MessageSquare size={16} />
                </button>
              </div>
              <div className="student-item">
                <div className="student-avatar">R</div>
                <div className="student-info">
                  <div className="student-name">涼太さん</div>
                  <div className="student-progress">
                    <div
                      className="student-progress-fill"
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                  <div className="student-meta">
                    <span>数学: 60%</span>
                    <span>8時間</span>
                  </div>
                </div>
                <button className="student-action">
                  <MessageSquare size={16} />
                </button>
              </div>
            </div>
          </section>

          <section className="assignments-section">
            <div className="section-header">
              <div className="section-title">課題管理</div>
              <div className="section-link">すべて表示</div>
            </div>
            <div className="assignment-tabs">
              <div className="assignment-tab active">進行中</div>
              <div className="assignment-tab">完了</div>
              <div className="assignment-tab">未発表</div>
            </div>
            <div className="assignment-list">
              <div className="assignment-item">
                <div className="assignment-icon">📐</div>
                <div className="assignment-info">
                  <div className="assignment-name">二次関数の基礎</div>
                  <div className="assignment-details">
                    締切: 11月20日 • 32人中25人提出
                  </div>
                </div>
                <div className="assignment-status status-assigned">進行中</div>
              </div>
              <div className="assignment-item">
                <div className="assignment-icon">📊</div>
                <div className="assignment-info">
                  <div className="assignment-name">中間テスト復習</div>
                  <div className="assignment-details">
                    締切: 11月15日 • 32人中30人提出
                  </div>
                </div>
                <div className="assignment-status status-completed">完了</div>
              </div>
              <div className="assignment-item">
                <div className="assignment-icon">🧮</div>
                <div className="assignment-info">
                  <div className="assignment-name">三角比の応用</div>
                  <div className="assignment-details">
                    締切: 11月25日 • 32人中10人提出
                  </div>
                </div>
                <div className="assignment-status status-assigned">進行中</div>
              </div>
            </div>
          </section>

          <section className="analytics-section">
            <div className="section-header">
              <div className="section-title">クラス分析</div>
              <div className="section-link">エクスポート</div>
            </div>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-value">78%</div>
                <div className="metric-name">平均参加率</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">7.2h</div>
                <div className="metric-name">週間学習時間</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">82%</div>
                <div className="metric-name">平均正答率</div>
              </div>
              <div className="metric-card">
                <div className="metric-value">14</div>
                <div className="metric-name">未提出課題</div>
              </div>
            </div>
            <div className="chart-container">
              <div className="chart-bar" style={{ height: '70%' }}>
                <div className="chart-label">月</div>
              </div>
              <div className="chart-bar" style={{ height: '85%' }}>
                <div className="chart-label">火</div>
              </div>
              <div className="chart-bar" style={{ height: '60%' }}>
                <div className="chart-label">水</div>
              </div>
              <div className="chart-bar" style={{ height: '90%' }}>
                <div className="chart-label">木</div>
              </div>
              <div className="chart-bar" style={{ height: '75%' }}>
                <div className="chart-label">金</div>
              </div>
              <div className="chart-bar" style={{ height: '40%' }}>
                <div className="chart-label">土</div>
              </div>
              <div className="chart-bar" style={{ height: '35%' }}>
                <div className="chart-label">日</div>
              </div>
            </div>
            <div
              style={{
                textAlign: 'center',
                fontSize: '14px',
                color: 'var(--gray)',
              }}
            >
              曜日別参加率
            </div>
          </section>

          <section className="intervention-section">
            <div className="section-header">
              <div className="section-title">介入が必要な生徒</div>
              <div className="section-link">すべて表示</div>
            </div>
            <div className="intervention-list">
              <div className="intervention-item">
                <div className="intervention-avatar">S</div>
                <div className="intervention-info">
                  <div className="intervention-name">さくらさん</div>
                  <div className="intervention-reason">
                    数学の進捗が45%と低い、集中度が低下
                  </div>
                </div>
                <button className="intervention-action">連絡</button>
              </div>
              <div className="intervention-item">
                <div className="intervention-avatar">Y</div>
                <div className="intervention-info">
                  <div className="intervention-name">優子さん</div>
                  <div className="intervention-reason">3日間連続で学習していない</div>
                </div>
                <button className="intervention-action">連絡</button>
              </div>
              <div className="intervention-item">
                <div className="intervention-avatar">T</div>
                <div className="intervention-info">
                  <div className="intervention-name">太郎さん</div>
                  <div className="intervention-reason">課題の未提出が3件ある</div>
                </div>
                <button className="intervention-action">連絡</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
