
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Mic,
  Video,
  LogOut,
  ThumbsUp,
  Hand,
  Pencil,
  Circle,
  Square,
  Triangle,
  Type,
  Undo,
  Clock,
  ArrowRight,
  Lightbulb,
  Check,
  RefreshCw,
  Home,
  BookOpen,
  Target,
  Users,
  BarChart,
  User,
} from 'lucide-react';
import './collab.css';

export default function CollabPage() {
  const whiteboardRef = useRef<HTMLCanvasElement>(null);
  const [isHandRaised, setIsHandRaised] = useState(false);

  useEffect(() => {
    const canvas = whiteboardRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    function resizeCanvas() {
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    }

    function startDrawing(e: MouseEvent) {
      isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function draw(e: MouseEvent) {
      if (!isDrawing || !ctx) return;

      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#4361ee';

      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();

      [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function stopDrawing() {
      isDrawing = false;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
    };
  }, []);

  const handleRaiseHand = () => {
    setIsHandRaised(!isHandRaised);
  };

  return (
    <>
      <div className="collab-container">
        <header className="room-header">
          <div className="room-info">
            <h1>数学 - 二次関数のグラフ</h1>
            <div className="room-meta">
              <span>レベル: 標準</span>
              <span>参加者: 3人</span>
            </div>
          </div>
          <div className="room-actions">
            <button className="icon-button">
              <Mic size={18} />
            </button>
            <button className="icon-button">
              <Video size={18} />
            </button>
            <button className="icon-button">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="room-main">
          <aside className="participants-sidebar">
            <div className="sidebar-header">
              <span>参加者</span>
              <span className="participants-count">3人</span>
            </div>
            <div className="participants-list">
              <div className="participant-card active">
                <div className="participant-avatar">
                  <span>A</span>
                  <div className="participant-status"></div>
                </div>
                <div className="participant-info">
                  <div className="participant-name">
                    <span>葵さん</span>
                    <span className="participant-role">説明中</span>
                  </div>
                  <div className="participant-action">二次関数を説明中</div>
                </div>
                <div className="participant-controls">
                  <button className="control-button">
                    <ThumbsUp size={14} />
                  </button>
                </div>
              </div>

              <div className="participant-card">
                <div className="participant-avatar">
                  <span>K</span>
                  <div className="participant-status"></div>
                </div>
                <div className="participant-info">
                  <div className="participant-name">健太さん</div>
                  <div className="participant-action">リスニング中</div>
                </div>
                <div className="participant-controls">
                  <button className="control-button">
                    <Hand size={14} />
                  </button>
                </div>
              </div>

              <div className="participant-card">
                <div className="participant-avatar">
                  <span>S</span>
                  <div className="participant-status away"></div>
                </div>
                <div className="participant-info">
                  <div className="participant-name">さくらさん</div>
                  <div className="participant-action">一時退出中</div>
                </div>
                <div className="participant-controls">
                  <button className="control-button">
                    <Hand size={14} />
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <main className="room-content">
            <div className="problem-container">
              <div className="problem-header">
                <div className="problem-title">
                  二次関数 y=2x²-4x+1 の頂点の座標を求めよ
                </div>
                <div className="problem-timer">
                  <Clock className="h-4 w-4" />
                  <span>05:30</span>
                </div>
              </div>
              <div className="problem-content">
                <p>
                  ヒント: 平方完成を使用して頂点を求めます。y=ax²+bx+c
                  の頂点のx座標は -b/2a です。
                </p>
              </div>
            </div>

            <div className="whiteboard-container">
              <canvas ref={whiteboardRef} className="whiteboard"></canvas>
              <div className="whiteboard-tools">
                <button className="tool-button active">
                  <Pencil size={18} />
                </button>
                <button className="tool-button">
                  <Circle size={18} />
                </button>
                <button className="tool-button">
                  <Square size={18} />
                </button>
                <button className="tool-button">
                  <Triangle size={18} />
                </button>
                <button className="tool-button">
                  <Type size={18} />
                </button>
                <button className="tool-button">
                  <Undo size={18} />
                </button>
                <div className="color-palette">
                  <div
                    className="color-option"
                    style={{ backgroundColor: '#000000' }}
                  ></div>
                  <div
                    className="color-option"
                    style={{ backgroundColor: '#4361ee' }}
                  ></div>
                  <div
                    className="color-option"
                    style={{ backgroundColor: '#f72585' }}
                  ></div>
                  <div
                    className="color-option"
                    style={{ backgroundColor: '#4cc9f0' }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="chat-container">
              <div className="chat-header">
                <div className="chat-tabs">
                  <div className="chat-tab active">チャット</div>
                  <div className="chat-tab">まとめ</div>
                </div>
              </div>
              <div className="chat-messages">
                <div className="message message-system">
                  さくらさんがルームに参加しました
                </div>
                <div className="message message-incoming">
                  <div className="message-sender">健太さん</div>
                  <div className="message-content">
                    頂点のx座標は -b/2a で求められるんだよね？
                  </div>
                </div>
                <div className="message message-outgoing">
                  <div className="message-content">
                    そうだよ！b=-4, a=2 だから x=4/4=1 になる
                  </div>
                </div>
                <div className="message message-incoming">
                  <div className="message-sender">健太さん</div>
                  <div className="message-content">
                    なるほど！それでyの値は元の式に代入すればいいのか
                  </div>
                </div>
              </div>
              <div className="stamp-container">
                <button className="stamp-button">👍 わかった</button>
                <button className="stamp-button">🤔 もう一度</button>
                <button className="stamp-button">📝 例題</button>
                <button className="stamp-button">💡 ヒント</button>
              </div>
              <div className="chat-input-container">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="メッセージを入力..."
                />
                <button className="send-button">
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </main>
        </div>
        <footer className="room-footer">
          <div className="footer-left">
            <button
              className={`footer-button button-secondary ${
                isHandRaised ? 'hand-raised' : ''
              }`}
              onClick={handleRaiseHand}
            >
              <Hand size={16} />
              <span>手を挙げる</span>
            </button>
            <button className="footer-button button-secondary">
              <Lightbulb size={16} />
              <span>ヒントを求める</span>
            </button>
          </div>
          <div className="footer-right">
            <button className="footer-button button-primary">
              <Check size={16} />
              <span>解答を提出</span>
            </button>
            <button className="footer-button button-accent">
              <RefreshCw size={16} />
              <span>交代する</span>
            </button>
          </div>
        </footer>
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
        <Link href="/collab" className="nav-item active">
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
