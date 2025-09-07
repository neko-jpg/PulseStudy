'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useModuleStore } from '@/stores/module';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, BookOpen, CheckCircle, Pencil, ArrowRight, ThumbsUp, XCircle, Loader2, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import './learn.css';

// --- DUMMY DATA ---
const DUMMY_QUESTIONS = {
  check: [{
    id: 'quad-1-check',
    text: '二次関数 y = ax² + bx + c のグラフで、係数 a が正 (a > 0) の場合、グラフはどちらに凸（とつ）ですか？',
    type: 'SC',
    options: [
      { id: 'check-opt-a', label: '上に凸' },
      { id: 'check-opt-b', label: '下に凸' },
    ],
  }],
  practice: [
    { id: 'quad-1-practice-1', text: '二次関数 y = x² - 4x + 3 を因数分解した形はどれ？', type: 'SC', options: [{id:'p1-opt-a', label:'(x-1)(x-3)'},{id:'p1-opt-b', label:'(x+1)(x+3)'}] },
    { id: 'quad-1-practice-2', text: 'y = 2(x-1)² + 5 の頂点の座標は？', type: 'SC', options: [{id:'p2-opt-a', label:'(-1, 5)'},{id:'p2-opt-b', label:'(1, -5)'},{id:'p2-opt-c', label:'(1, 5)'}] },
    { id: 'quad-1-practice-3', text: 'y = -x² のグラフはどれ？', type: 'SC', options: [{id:'p3-opt-a', label:'上に凸'},{id:'p3-opt-b', label:'下に凸'}] }
  ]
};

// --- COACH BAR COMPONENT ---
const CoachBar = ({ onContinue, onStop }: { onContinue: () => void, onStop: () => void }) => (
  <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md z-50 animate-in slide-in-from-bottom-10 duration-500">
    <Card className="bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 shadow-lg">
      <CardHeader><CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200"><Trophy className="h-6 w-6" />素晴らしい！波に乗っていますね！</CardTitle></CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-2"><Button onClick={onStop} className="flex-1" variant="outline">進捗を見る</Button><Button onClick={onContinue} className="flex-1">もう1問</Button></CardContent>
    </Card>
  </div>
);

// --- REUSABLE QUIZ COMPONENT ---
const QuizArea = ({ questions, onComplete, isPractice = false }: { questions: any[], onComplete: () => void, isPractice?: boolean }) => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean, explain?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { streak, incrementStreak, resetStreak } = useModuleStore();
  const [showCoachBar, setShowCoachBar] = useState(false);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (isPractice && streak === 3) { setShowCoachBar(true); }
  }, [streak, isPractice]);

  const handleSubmit = async () => {
    if (!selectedAnswer) return;
    setIsSubmitting(true);
    const res = await fetch('/api/quiz/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionId: currentQuestion.id, answer: selectedAnswer }), });
    const result = await res.json();
    setFeedback(result);
    if (result.correct) { incrementStreak(); } else { resetStreak(); }
    setIsSubmitting(false);
  };
  const handleNext = () => {
    if (currentIndex < questions.length - 1) { setCurrentIndex(currentIndex + 1); setSelectedAnswer(null); setFeedback(null); } else { onComplete(); }
  };

  return (
    <div className="space-y-6">
      {isPractice && showCoachBar && <CoachBar onContinue={() => setShowCoachBar(false)} onStop={() => router.push('/analytics')} />}
      <p className="text-sm text-muted-foreground">問題 {currentIndex + 1} / {questions.length} (連続正解: {streak})</p>
      <p className="font-semibold text-lg">{currentQuestion.text}</p>
      <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer} disabled={!!feedback}>
        {currentQuestion.options.map((opt: any) => (
          <div key={opt.id} className="flex items-center space-x-2"><RadioGroupItem value={opt.label} id={opt.id} /><Label htmlFor={opt.id}>{opt.label}</Label></div>
        ))}
      </RadioGroup>
      {feedback && (<Alert variant={feedback.correct ? "default" : "destructive"}>{feedback.correct ? <ThumbsUp className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}<AlertTitle>{feedback.correct ? '正解！' : '不正解'}</AlertTitle>{feedback.explain && <AlertDescription>{feedback.explain}</AlertDescription>}</Alert>)}
      <div className="flex justify-end">{!feedback ? (<Button onClick={handleSubmit} disabled={!selectedAnswer || isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}回答する</Button>) : (<Button onClick={handleNext}>{currentIndex === questions.length - 1 ? '完了' : '次の問題へ'} <ArrowRight className="ml-2 h-4 w-4" /></Button>)}</div>
    </div>
  );
};

// --- PANELS (omitting ExplainPanel for brevity) ---
const ExplainPanel = ({ onNext }: { onNext: () => void }) => (<Card className="mt-4"><CardHeader><CardTitle className="flex items-center"><BookOpen className="mr-2 h-5 w-5" /> 1. 解説</CardTitle></CardHeader><CardContent><div className="text-center pt-4 border-t"><Button size="lg" onClick={onNext}>理解チェックへ進む <ArrowRight className="ml-2 h-4 w-4" /></Button></div></CardContent></Card>);
const CheckPanel = ({ onNext }: { onNext: () => void }) => (<Card className="mt-4"><CardHeader><CardTitle>2. 理解チェック</CardTitle></CardHeader><CardContent><QuizArea questions={DUMMY_QUESTIONS.check} onComplete={onNext} /></CardContent></Card>);
const PracticePanel = ({ onComplete }: { onComplete: () => void }) => (<Card className="mt-4"><CardHeader><CardTitle>3. 演習</CardTitle></CardHeader><CardContent><QuizArea questions={DUMMY_QUESTIONS.practice} onComplete={onComplete} isPractice={true} /></CardContent></Card>);

// --- MAIN PAGE COMPONENT ---
export default function LearnPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get('module');
  const { step, setStep, setModuleId, resetStreak } = useModuleStore();

  useEffect(() => {
    if (moduleId) setModuleId(moduleId);
    resetStreak();
    return () => { setStep('explain'); resetStreak(); };
  }, [moduleId, setModuleId, setStep, resetStreak]);

  const handlePracticeComplete = () => { alert('演習完了！ホームに戻ります。'); router.push('/home'); };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center p-2 border-b bg-background z-20"><Button variant="ghost" size="icon" onClick={() => router.push('/home')}><ArrowLeft /></Button><h1 className="ml-2 font-bold text-md sm:text-lg truncate">{moduleId ? `学習中: ${moduleId}` : '学習モジュール'}</h1></header>
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <Tabs value={step} onValueChange={(value) => setStep(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-14">
            <TabsTrigger value="explain" className="flex-col sm:flex-row gap-1"><BookOpen className="h-4 w-4" /> 解説</TabsTrigger>
            <TabsTrigger value="check" className="flex-col sm:flex-row gap-1"><CheckCircle className="h-4 w-4" /> 理解チェック</TabsTrigger>
            <TabsTrigger value="practice" className="flex-col sm:flex-row gap-1"><Pencil className="h-4 w-4" /> 演習</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <main className="flex-1 p-4 overflow-y-auto">
        {step === 'explain' && <ExplainPanel onNext={() => setStep('check')} />}
        {step === 'check' && <CheckPanel onNext={() => setStep('practice')} />}
        {step === 'practice' && <PracticePanel onComplete={handlePracticeComplete} />}
      </main>
    </div>
  );
}
