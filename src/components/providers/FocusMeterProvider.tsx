'use client';

import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { useFocusStore } from '@/store/focusStore';
import { defaultConfig } from '@/lib/focus-config';
import { stabilize } from '@/lib/focus-meter/stabilizer';
import type { FocusConfig, FocusState } from '@/lib/focus-meter/types';

interface FocusMeterContextType {
  start: () => void;
  stop: () => void;
  setMode: (mode: string) => void;
}

export const FocusMeterContext = createContext<FocusMeterContextType | undefined>(undefined);

interface FocusMeterProviderProps {
  children: React.ReactNode;
  config?: Partial<FocusConfig>;
}

export function FocusMeterProvider({ children, config: userConfig }: FocusMeterProviderProps) {
  const { output, setState, setFocus } = useFocusStore();
  const [isSessionActive, setIsSessionActive] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pipelineStateRef = useRef({
    history: [] as number[],
    lastTick: Date.now(),
    currentState: 'paused' as FocusState,
  });

  const config = { ...defaultConfig, ...userConfig };

  const stopPipeline = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    pipelineStateRef.current.currentState = 'paused';
    setState('paused');
  }, [setState]);

  const startPipeline = useCallback(() => {
    stopPipeline();
    pipelineStateRef.current.currentState = 'warming_up';
    setState('warming_up');
    pipelineStateRef.current.history = [];
    pipelineStateRef.current.lastTick = Date.now();

    setTimeout(() => {
      pipelineStateRef.current.currentState = 'active';
      setState('active');

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const dt = (now - pipelineStateRef.current.lastTick) / 1000.0;
        pipelineStateRef.current.lastTick = now;

        const rawValue = Math.random();

        const stabilizedValue = stabilize(
          rawValue,
          dt,
          config,
          pipelineStateRef.current.history,
          output.value
        );

        // --- Hysteresis State Machine Logic ---
        const { on, off } = config.hysteresis;
        let nextState = pipelineStateRef.current.currentState;

        if (nextState === 'active' && stabilizedValue < off) {
          nextState = 'paused'; // Simplified for now, could be 'no-signal' or other state
        } else if (nextState !== 'active' && stabilizedValue > on) {
          nextState = 'active';
        }

        if (nextState !== pipelineStateRef.current.currentState) {
          pipelineStateRef.current.currentState = nextState;
          setState(nextState);
        }
        // --- End State Machine ---

        const newQuality = rawValue > 0.3 ? (rawValue > 0.7 ? 'high' : 'mid') : 'low';

        setFocus({
          raw: rawValue,
          value: stabilizedValue,
          quality: newQuality,
        });

      }, 1000 / config.freq.uiHz);
    }, 500);
  }, [config, output.value, setFocus, setState, stopPipeline]);

  const start = useCallback(() => {
    console.log('Focus session started.');
    setIsSessionActive(true);
    startPipeline();
  }, [startPipeline]);

  const stop = useCallback(() => {
    console.log('Focus session stopped.');
    setIsSessionActive(false);
    stopPipeline();
  }, [stopPipeline]);

  const setMode = useCallback((mode: string) => {
    console.log(`Focus mode set to: ${mode}`);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isSessionActive) return;
      if (document.visibilityState === 'hidden') {
        // Don't fully stop, just pause the state machine
        if (intervalRef.current) {
            pipelineStateRef.current.currentState = 'paused';
            setState('paused');
        }
      } else {
        // On visible, go to warming up then active
        pipelineStateRef.current.currentState = 'warming_up';
        setState('warming_up');
        setTimeout(() => {
            pipelineStateRef.current.currentState = 'active';
            setState('active');
        }, 500);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSessionActive, setState]);

  useEffect(() => () => stopPipeline(), [stopPipeline]);

  const contextValue = { start, stop, setMode };

  return (
    <FocusMeterContext.Provider value={contextValue}>
      {children}
    </FocusMeterContext.Provider>
  );
}
