
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Bell,
  Flame,
  Timer,
  BarChart,
  Trophy,
  Zap,
  Home,
  BookOpen,
  Target,
  Users,
  User,
} from 'lucide-react';
import './home.css';

export default function HomePage() {
  useEffect(() => {
    const setCurrentDate = () => {
      const dateElement = document.getElementById('current-date');
      if (dateElement) {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        };
        dateElement.textContent = now.toLocaleDateString('ja-JP', options);
      }
    };

    setCurrentDate();
  }, []);

  const startLearning = (moduleId: number) => {
    alert(`モジュール ${moduleId} を開始します！`);
    // 実際の実装ではここで学習画面に遷移する
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-top">
          <div className="user-info">
            <Link href="/profile">
              <Avatar>
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <div>葵さん</div>
              <div className="streak">
                <Flame className="h-4 w-4" />
                <span className="streak-count">7日</span>
              </div>
            </div>
          </div>
          <div className="notification">
            <Link href="/notifications">
              <Bell />
            </Link>
          </div>
        </div>
        <div className="greeting">
          <h1>
            今日も学びを
            <br />
            高めましょう
          </h1>
        </div>
        <div className="date" id="current-date"></div>
      </header>

      <div className="container-inner">
        <section className="quick-start">
          <div className="section-title">
            <span>今日やる</span>
            <Link href="#" className="see-all">
              すべて見る
            </Link>
          </div>

          <Card className="task-card">
            <CardHeader>
              <div className="task-subject">数学</div>
              <CardTitle className="task-title">
                二次関数のグラフをマスター
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="task-meta">
                <div className="task-meta-item">
                  <Timer className="h-4 w-4" /> 5分
                </div>
                <div className="task-meta-item">
                  <BarChart className="h-4 w-4" /> 3問
                </div>
              </div>
              <Button
                className="start-button"
                onClick={() => startLearning(1)}
              >
                続きから始める
              </Button>
            </CardContent>
          </Card>

          <Card className="task-card recommended">
            <CardHeader>
              <div className="task-subject">英語</div>
              <CardTitle className="task-title">苦手な不定詞を克服</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="task-meta">
                <div className="task-meta-item">
                  <Timer className="h-4 w-4" /> 5分
                </div>
                <div className="task-meta-item">
                  <BarChart className="h-4 w-4" /> 4問
                </div>
              </div>
              <Button
                className="start-button"
                onClick={() => startLearning(2)}
              >
                始める
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="pulse-section">
          <div className="section-title">
            <span>没入度パルス</span>
          </div>
          <Card className="pulse-card">
            <CardContent>
              <div className="pulse-header">
                <div className="pulse-title">集中度</div>
                <div className="pulse-value">78%</div>
              </div>
              <div className="sparkline">
                <div className="sparkline-fill"></div>
              </div>
              <div className="pulse-days">
                <span>月</span>
                <span>火</span>
                <span>水</span>
                <span>木</span>
                <span>金</span>
                <span>土</span>
                <span>日</span>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="challenge-section">
          <div className="section-title">
            <span>チャレンジ</span>
            <Link href="/challenge" className="see-all">
              すべて見る
            </Link>
          </div>

          <Card className="challenge-card">
            <CardContent>
              <div className="challenge-icon">
                <Trophy />
              </div>
              <div className="challenge-info">
                <div className="challenge-title">5日連続学習</div>
                <div className="challenge-desc">あと2日で達成！</div>
                <Progress value={65} className="progress-bar" />
              </div>
            </CardContent>
          </Card>

          <Card className="challenge-card">
            <CardContent>
              <div className="challenge-icon">
                <Zap />
              </div>
              <div className="challenge-info">
                <div className="challenge-title">朝活マスター</div>
                <div className="challenge-desc">今週3回の朝学習</div>
                <Progress value={33} className="progress-bar" />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="community-section">
          <div className="section-title">
            <span>友達の活動</span>
            <Link href="#" className="see-all">
              すべて見る
            </Link>
          </div>

          <div className="friend-activity">
            <Avatar className="friend-avatar">
              <AvatarFallback>K</AvatarFallback>
            </Avatar>
            <div className="friend-info">
              <div className="friend-name">健太</div>
              <div className="friend-action">数学のクイズを完了</div>
            </div>
            <div className="friend-time">12分前</div>
          </div>

          <div className="friend-activity">
            <Avatar className="friend-avatar">
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <div className="friend-info">
              <div className="friend-name">さくら</div>
              <div className="friend-action">3日連続で学習中</div>
            </div>
            <div className="friend-time">1時間前</div>
          </div>

          <div className="friend-activity">
            <Avatar className="friend-avatar">
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
            <div className="friend-info">
              <div className="friend-name">涼太</div>
              <div className="friend-action">新しいバッジを獲得</div>
            </div>
            <div className="friend-time">2時間前</div>
          </div>
        </section>
      </div>

      <nav className="bottom-nav">
        <Link href="/home" className="nav-item active">
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
    </div>
  );
}
