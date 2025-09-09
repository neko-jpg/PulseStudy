'use client';

import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { useFocusStore } from '@/store/focusStore';
import { defaultConfig } from '@/lib/focus-config';
import { stabilize } from '@/lib/focus-meter/stabilizer';
import { createFaceLandmarker } from '@/lib/focus-meter/mediapipe-service';
import { extractFeatures } from '@/lib/focus-meter/feature-extractor';
import { calculateScore } from '@/lib/focus-meter/scorer';
import type { FaceLandmarker } from '@mediapipe/tasks-vision';
import type { FocusConfig, FocusState } from '@/lib/focus-meter/types';

type PermissionState = 'prompt' | 'granted' | 'denied';

interface FocusMeterContextType {
  start: () => void;
  stop: () => void;
  setMode: (mode: string) => void;
  permission: PermissionState;
}

export const FocusMeterContext = createContext<FocusMeterContextType | undefined>(undefined);

interface FocusMeterProviderProps {
  children: React.ReactNode;
  config?: Partial<FocusConfig>;
}

export function FocusMeterProvider({ children, config: userConfig }: FocusMeterProviderProps) {
  const { output, setState, setFocus } = useFocusStore();
  const [permission, setPermission] = useState<PermissionState>('prompt');

  const videoRef = useRef<HTMLVideoElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const pipelineStateRef = useRef({
    history: [] as number[],
    lastTick: Date.now(),
    currentState: 'paused' as FocusState,
  });

  const config = { ...defaultConfig, ...userConfig };

  const stopDetectionLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    console.log('Focus session stopping.');
    stopDetectionLoop();

    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    pipelineStateRef.current.currentState = 'paused';
    setState('paused');
  }, [setState, stopDetectionLoop]);

  const startDetectionLoop = useCallback(async () => {
    if (!videoRef.current || !landmarkerRef.current) return;

    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    let lastVideoTime = -1;

    const detect = async () => {
      if (video.readyState < 2) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const startTimeMs = performance.now();
        const results = landmarker.detectForVideo(video, startTimeMs);

        let rawValue = 0;
        let features = null;

        if (results.faceLandmarks.length > 0) {
          features = extractFeatures(results);
          rawValue = calculateScore(features, config);
        } else {
          // No face detected, treat as low signal.
          rawValue = 0;
        }

        const now = Date.now();
        const dt = (now - pipelineStateRef.current.lastTick) / 1000.0;
        pipelineStateRef.current.lastTick = now;

        const stabilizedValue = stabilize(rawValue, dt, config, pipelineStateRef.current.history, output.value);

        const { on, off } = config.hysteresis;
        let nextState = pipelineStateRef.current.currentState;
        if (nextState === 'active' && stabilizedValue < off) nextState = 'paused';
        else if (nextState !== 'active' && stabilizedValue > on) nextState = 'active';

        if (nextState !== pipelineStateRef.current.currentState) {
            pipelineStateRef.current.currentState = nextState;
            setState(nextState);
        }

        setFocus({
          raw: rawValue,
          value: stabilizedValue,
          quality: results.faceLandmarks.length > 0 ? 'high' : 'low', // Simple quality metric for now
          // We can add the features to the store if needed later
        });
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  }, [config, output.value, setFocus, setState]);

  const start = useCallback(async () => {
    console.log('Focus session starting...');
    if (animationFrameRef.current) {
        console.warn('Detection loop already running.');
        return;
    }

    try {
      // 1. Get MediaPipe Landmarker instance
      landmarkerRef.current = await createFaceLandmarker();

      // 2. Get camera permissions and stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });
      setPermission('granted');

      // 3. Set video stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => {
            pipelineStateRef.current.currentState = 'warming_up';
            setState('warming_up');
            setTimeout(() => {
                pipelineStateRef.current.currentState = 'active';
                setState('active');
                startDetectionLoop();
            }, 500);
        });
      }
    } catch (err) {
      console.error("Failed to start camera:", err);
      setPermission('denied');
    }
  }, [startDetectionLoop, setState]);

  useEffect(() => () => stop(), [stop]);

  const contextValue = { start, stop, setMode: (mode: string) => console.log(`Mode set to ${mode}`), permission };

  return (
    <FocusMeterContext.Provider value={contextValue}>
      {/* This video element is required for MediaPipe processing but not visible to the user */}
      <video ref={videoRef} autoPlay playsInline style={{ display: 'none' }} />
      {children}
    </FocusMeterContext.Provider>
  );
}
