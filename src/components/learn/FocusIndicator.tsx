'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useHomeStore, type CameraPermission } from '@/store/homeStore';
import { usePulseEngine } from '@/hooks/usePulseEngine';
import type { PulseEngineOutput } from '@/lib/pulse-engine';
import { BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function FocusIndicator() {
  const {
    setPulseEngineEnabled,
    cameraPermission,
    setCameraPermission,
    setPulse,
    pulse,
  } = useHomeStore();

  const handleUpdate = useCallback((output: PulseEngineOutput) => {
    const score = Math.round(output.smoothedScore * 100);
    setPulse(score);
  }, [setPulse]);

  const handlePermissionChange = useCallback((status: CameraPermission) => {
    setCameraPermission(status);
  }, [setCameraPermission]);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Automatically enable the engine when this component is mounted
  useEffect(() => {
    setPulseEngineEnabled(true);
    // Disable it on unmount
    return () => {
      setPulseEngineEnabled(false);
    };
  }, [setPulseEngineEnabled]);

  usePulseEngine({
    enabled: true, // Always enabled when this component is rendered
    onUpdate: handleUpdate,
    onPermissionChange: handlePermissionChange,
    videoEl: videoRef.current,
  });

  const getPulseColor = () => {
    if (cameraPermission !== 'granted') return 'text-gray-500';
    if (pulse > 70) return 'text-green-400';
    if (pulse > 40) return 'text-yellow-400';
    return 'text-red-400';
  }

  const getTooltipText = () => {
    if (cameraPermission === 'denied') return 'カメラへのアクセスがブロックされています';
    if (cameraPermission === 'pending') return 'カメラの許可を待っています...';
    if (cameraPermission !== 'granted') return '集中度を計測できません';
    return `現在の集中度: ${pulse}%`;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg">
            <video ref={videoRef} muted playsInline autoPlay style={{ display: 'none' }} />
            <BrainCircuit className={cn("transition-colors", getPulseColor())} />
            <span className={cn("font-bold text-sm w-8", getPulseColor())}>
              {cameraPermission === 'granted' ? `${pulse}%` : '--'}
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
