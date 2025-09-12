'use client';

import { useEffect } from 'react';
import { useFocusMeter } from '@/hooks/useFocusMeter';
import { useFocusStore } from '@/store/focusStore';
import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function FocusIndicator() {
  const { start, stop } = useFocusMeter();
  const { value, state } = useFocusStore((s) => s.output);
  const score = Math.round(value * 100);

  // 自動開始は行わない（明示操作で開始）


  const getPulseColor = () => {
    if (state !== 'active') return 'text-gray-500';
    if (score > 70) return 'text-green-400';
    if (score > 40) return 'text-yellow-400';
    return 'text-red-400';
  }

  const getTooltipText = () => {
    if (state === 'no-signal') return 'カメラへのアクセスがありません';
    if (state === 'warming_up' || state === 'calibrating') return '集中度をキャリブレーション中...';
    if (state !== 'active') return '集中度を計測できません';
    return `現在の集中度: ${score}%`;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg">
            <BrainCircuit className={cn("transition-colors", getPulseColor())} />
            <span className={cn("font-bold text-sm w-8", getPulseColor())}>
              {state === 'active' ? `${score}%` : '--'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
