
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Timer,
  Book,
  BrainCircuit,
  Video,
  Play,
  Lightbulb,
  ThumbsUp,
  Pause,
  Home,
  BookOpen,
  Target,
  Users,
  BarChart,
  User,
} from 'lucide-react';
import './learn.css';

export default function LearnPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState<HTMLElement | null>(
    null
  );
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showAIResponse, setShowAIResponse] = useState(false);
  const [aiResponseText, setAiResponseText] = useState('');
  const [showInterventionModal, setShowInterventionModal] = useState(false);

  const totalSteps = 3;
  const questions = [
    {
      text: '二次関数 y=2x²-4x+1 の頂点の座標はどれですか？',
      options: ['(1, -1)', '(2, 1)', '(1, 2)', '(-1, 2)'],
      answer: '(1, -1)',
      explanation:
        '頂点のx座標は -b/2a = 4/4 = 1 です。これを元の式に代入すると y=2(1)²-4(1)+1 = -1 となります。よって頂点は (1, -1) です。',
    },
    {
      text: '二次関数 y=-x²+6x-5 のグラフはどちらに凸ですか？',
      options: ['上に凸', '下に凸', 'どちらでもない', '直線になる'],
      answer: '上に凸',
      explanation:
        'x²の係数 a が負の数 (-1) なので、グラフは上に凸の放物線になります。',
    },
    {
      text: 'y=x² のグラフをx軸方向に2, y軸方向に3だけ平行移動したグラフの式は？',
      options: [
        'y=(x-2)²+3',
        'y=(x+2)²+3',
        'y=(x-2)²-3',
        'y=(x+3)²-2',
      ],
      answer: 'y=(x-2)²+3',
      explanation:
        'x軸方向にp, y軸方向にqだけ平行移動した場合、式は y=(x-p)²+q となります。',
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInterventionModal(true);
    }, 15000); // 15秒後にモーダル表示

    return () => clearTimeout(timer);
  }, []);

  const handleGoBack = () => {
    if (confirm('学習を中断しますか？\n進捗は自動的に保存されます。')) {
      router.push('/home');
    }
  };

  const handleSelectOption = (
    e: React.MouseEvent<HTMLButtonElement>,
    option: string
  ) => {
    const target = e.currentTarget;
    if (selectedOption !== null) return;

    setSelectedOption(target);
    const correct = option === questions[currentStep - 1].answer;
    setIsCorrect(correct);
    setShowFeedback(true);
    setShowNextButton(true);
  };

  const handleNextQuestion = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setShowFeedback(false);
      setShowNextButton(false);
      const progressFill = document.getElementById('progress-fill');
      if (progressFill) {
        progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
      }
    } else {
      alert('すべての問題を完了しました！');
      router.push('/home');
    }
  };

  const handleShowAIResponse = (question: string) => {
    setAiResponseText(
      `${question} に対する回答です。AIが、あなたの疑問に答えます。`
    );
    setShowAIResponse(true);
  };

  return (
    <>
    <div className="module-container">
      <header className="module-header">
        <div className="header-left">
          <button className="back-button" onClick={handleGoBack}>
            <ArrowLeft size={20} />
          </button>
          <div className="module-info">
            <h1>二次関数のグラフをマスター</h1>
            <div className="module-meta">
              <span>数学</span>
              <span>
                <Timer size={14} className="inline" /> 5分
              </span>
            </div>
          </div>
        </div>
        <div className="flow-meter" onClick={() => alert('集中度: 78%')}>
          <BrainCircuit size={16} />
          <div className="flow-value">78%</div>
        </div>
      </header>

      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-fill"
            id="progress-fill"
            style={{ width: `${((currentStep - 1) / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="progress-steps">
          <span>解説</span>
          <span>理解チェック</span>
          <span>演習</span>
        </div>
      </div>

      <main className="module-content">
        <section className="explanation-section">
          <div className="video-container">
            <div className="video-placeholder">
              <Video size={48} />
            </div>
            <div className="video-controls">
              <button className="play-button">
                <Play size={20} color="var(--primary)" />
              </button>
              <div className="video-time">0:45 / 1:30</div>
            </div>
          </div>

          <div className="explanation-text">
            <h2>二次関数のグラフの性質</h2>
            <p>
              二次関数 y=ax²+bx+c のグラフは放物線と呼ばれる曲線です。
            </p>
            <p>
              a &gt; 0 のとき、グラフは下に凸（とつ）の形になり、a &lt; 0
              のときは上に凸の形になります。
            </p>
            <p>
              放物線の頂点は関数の最大値または最小値を取る点で、その座標は平方完成によって求めることができます。
            </p>
          </div>
        </section>

        <section className="ai-qa-section">
          <div className="ai-qa-header">
            <div className="ai-avatar">
              <BrainCircuit size={16} />
            </div>
            <div className="ai-title">学習アシスタントに質問</div>
          </div>

          <div className="qa-chip-container">
            <button
              className="qa-chip"
              onClick={() => handleShowAIResponse('頂点の求め方を教えて')}
            >
              頂点の求め方を教えて
            </button>
            <button
              className="qa-chip"
              onClick={() => handleShowAIResponse('平方完成とは？')}
            >
              平方完成とは？
            </button>
            <button
              className="qa-chip"
              onClick={() =>
                handleShowAIResponse('aの値でグラフはどう変わる？')
              }
            >
              aの値でグラフはどう変わる？
            </button>
          </div>

          {showAIResponse && (
            <div className="ai-response show">
              <p>{aiResponseText}</p>
              <div
                className="read-more"
                onClick={() => alert('より詳細な説明を表示します...')}
              >
                くわしく読む
              </div>
            </div>
          )}
        </section>

        <section className="exercise-section">
          <div className="exercise-header">
            <div className="exercise-title">理解度チェック</div>
            <div className="exercise-progress">
              {currentStep}/{totalSteps}
            </div>
          </div>

          <div className="question-container">
            <div className="question-text">
              {questions[currentStep - 1].text}
            </div>

            <div className="options-container">
              {questions[currentStep - 1].options.map((option, index) => (
                <button
                  key={index}
                  className={`option ${
                    selectedOption === event?.target && isCorrect === true
                      ? 'correct'
                      : ''
                  } ${
                    selectedOption === event?.target && isCorrect === false
                      ? 'incorrect'
                      : ''
                  } ${
                    showFeedback &&
                    option === questions[currentStep - 1].answer &&
                    isCorrect === false
                      ? 'correct'
                      : ''
                  }`}
                  onClick={(e) => handleSelectOption(e, option)}
                  disabled={showFeedback}
                >
                  {option}
                </button>
              ))}
            </div>

            {showFeedback && (
              <div
                className={`feedback-container show ${
                  isCorrect ? 'feedback-correct' : 'feedback-incorrect'
                }`}
              >
                <div className="feedback-title">
                  {isCorrect ? '正解！' : '不正解'}
                </div>
                <p>{questions[currentStep - 1].explanation}</p>
              </div>
            )}

            {showNextButton && (
              <button className="next-button show" onClick={handleNextQuestion}>
                {currentStep === totalSteps ? '完了する' : '次の問題'}
              </button>
            )}
          </div>
        </section>
      </main>

      <footer className="module-footer">
        <button className="footer-button button-outline">
          <Pause size={16} /> 一時停止
        </button>
        <button className="footer-button button-primary">
          <ThumbsUp size={16} /> 理解した
        </button>
      </footer>

      {showInterventionModal && (
        <div className="intervention-modal show">
          <div className="modal-content">
            <div className="modal-icon">😴</div>
            <div className="modal-title">集中力が低下しています</div>
            <div className="modal-text">
              少し休憩するか、別の学習方法を試してみませんか？
            </div>
            <div className="modal-buttons">
              <button
                className="modal-button button-light"
                onClick={() => setShowInterventionModal(false)}
              >
                休憩する
              </button>
              <button
                className="modal-button button-accent"
                onClick={() => {
                  alert('クイズ形式やグループ学習をおすすめします！');
                  setShowInterventionModal(false);
                }}
              >
                別の方法を提案
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
     <nav className="bottom-nav">
        <Link href="/home" className="nav-item">
          <Home className="nav-icon" />
          <span>ホーム</span>
        </Link>
        <Link href="/learn-top" className="nav-item active">
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
