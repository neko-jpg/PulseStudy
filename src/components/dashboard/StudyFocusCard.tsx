import { BrainCircuit, Zap, Timer, ListChecks, PlayCircle } from 'lucide-react';
import Link from 'next/link';

type StudyFocusCardProps = {
  aiCommand: string;
  taskTitle: string;
  focusPoints: number;
  durationMinutes: number;
  questionCount: number;
  progressPercentage: number;
  taskUrl: string;
};

export function StudyFocusCard({
  aiCommand,
  taskTitle,
  focusPoints,
  durationMinutes,
  questionCount,
  progressPercentage,
  taskUrl,
}: StudyFocusCardProps) {
  return (
    <div className="w-full bg-slate-800/50 backdrop-blur-lg rounded-3xl border border-slate-700 p-8 pulse-animation">
      <div className="flex items-start mb-6">
        <BrainCircuit className="h-10 w-10 text-blue-400 mr-4 flex-shrink-0" />
        <div className="bg-slate-700 rounded-lg p-4 text-slate-300 relative">
          <div className="absolute -left-2 top-4 w-4 h-4 bg-slate-700 transform rotate-45"></div>
          {aiCommand}
        </div>
      </div>
      <h2 className="text-5xl font-black text-white mb-4">{taskTitle}</h2>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4 text-slate-300">
          <div className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-green-400" />
            <span className="font-bold text-lg text-white">{focusPoints} FP</span>
          </div>
          <div className="flex items-center">
            <Timer className="h-5 w-5 mr-2 text-blue-400" />
            <span className="text-lg">{durationMinutes}分</span>
          </div>
          <div className="flex items-center">
            <ListChecks className="h-5 w-5 mr-2 text-orange-400" />
            <span className="text-lg">{questionCount}問</span>
          </div>
        </div>
        <div className="w-1/3">
          <div className="h-3 bg-slate-700 rounded-full">
            <div
              className="h-3 bg-blue-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      <Link href={taskUrl} passHref>
        <button className="w-full py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-2xl font-bold rounded-xl shadow-lg start-button flex items-center justify-center">
          <PlayCircle className="h-8 w-8 mr-3" />
          学習を始める
        </button>
      </Link>
    </div>
  );
}
