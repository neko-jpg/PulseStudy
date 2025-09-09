"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaceLandmarker } from "@mediapipe/tasks-vision";
import { createFaceLandmarker } from "@/lib/focus-meter/mediapipe-service";
import { PulseEngine, type PulseEngineOutput } from "@/lib/pulse-engine";
import { CameraPermission } from "@/store/homeStore";

type UsePulseEngineProps = {
  enabled: boolean;
  onUpdate: (output: PulseEngineOutput) => void;
  onPermissionChange: (status: CameraPermission) => void;
  /**
   * Optional video element to attach the camera stream to. If not provided,
   * the hook will create an off-screen video element as before.
   */
  videoEl?: HTMLVideoElement | null;
};

export function usePulseEngine({ enabled, onUpdate, onPermissionChange, videoEl }: UsePulseEngineProps) {
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const requestRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const pulseEngineRef = useRef<PulseEngine | null>(null);
  const lastDetectTimeRef = useRef<number>(0);
  const lastDecayTimeRef = useRef<number>(0);
  const prevOutputRef = useRef<PulseEngineOutput | null>(null);

  // 1. Initialize FaceLandmarker and PulseEngine
  const setup = useCallback(async () => {
    if (pulseEngineRef.current || faceLandmarker) return;

    let restoreConsoleError: (() => void) | null = null;
    try {
      if (process.env.NODE_ENV === 'development') {
        const originalConsoleError = console.error;
        let ignoredCount = 0;
        console.error = (...args: any[]) => {
          const message = typeof args[0] === 'string' ? args[0] : '';
          const stack = new Error().stack || '';
          const isMpInfo =
            message.includes('Created TensorFlow Lite XNNPACK delegate for CPU') &&
            stack.includes('vision_wasm_internal');
          if (isMpInfo) {
            ignoredCount++;
            console.debug(`[Dev-Only] Suppressed MediaPipe Info Log #${ignoredCount}:`, ...args);
            return;
          }
          originalConsoleError(...args);
        };
        restoreConsoleError = () => { console.error = originalConsoleError; };
      }
      pulseEngineRef.current = new PulseEngine();
      const landmarker = await createFaceLandmarker();
      setFaceLandmarker(landmarker);
    } catch (e) {
      console.error("Failed to initialize Pulse Engine:", e);
      onPermissionChange('denied');
    } finally {
      restoreConsoleError?.();
    }
  }, [onPermissionChange, faceLandmarker]);

  useEffect(() => {
    setup();
  }, [setup]);

  // 2. Handle Page Visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!enabled) return;
      if (document.hidden) {
        if (prevOutputRef.current && prevOutputRef.current.state !== 'paused') {
          const pausedState = { ...prevOutputRef.current, state: 'paused' as const };
          prevOutputRef.current = pausedState;
          onUpdate(pausedState);
        }
      } else {
        setIsWarmingUp(true);
        if (prevOutputRef.current) {
            const warmupState = { ...prevOutputRef.current, state: 'warming_up' as const };
            onUpdate(warmupState);
        }
        setTimeout(() => setIsWarmingUp(false), 2000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [onUpdate, enabled]);

  // 3. Main processing loop
  const runPrediction = useCallback((now: number) => {
    if (!pulseEngineRef.current) return;
    requestRef.current = requestAnimationFrame(runPrediction);

    const video = videoRef.current;
    if (document.hidden || !video || video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
      const timeSinceLastDecay = now - lastDecayTimeRef.current;
      if (prevOutputRef.current && prevOutputRef.current.smoothedScore > 0 && timeSinceLastDecay > 1000) {
        const newValue = Math.max(0, prevOutputRef.current.smoothedScore - 0.05); // Decay by 5% per second
        const decayingState: PulseEngineOutput = { ...prevOutputRef.current, smoothedScore: newValue, state: 'paused' };
        prevOutputRef.current = decayingState;
        onUpdate(decayingState);
        lastDecayTimeRef.current = now;
      }
      return;
    }

    if (isWarmingUp) return;

    const detectHz = 12;
    if (now - lastDetectTimeRef.current < 1000 / detectHz) return;
    lastDetectTimeRef.current = now;

    const results = faceLandmarker?.detectForVideo(video, now);
    if (results?.faceLandmarks?.length) {
      const output = pulseEngineRef.current.processFrame(results, Date.now());
      prevOutputRef.current = output;
      onUpdate(output);
    } else {
      if (prevOutputRef.current && prevOutputRef.current.state !== 'no-signal') {
        const noSignalState = { ...prevOutputRef.current, state: 'no-signal' as const };
        prevOutputRef.current = noSignalState;
        onUpdate(noSignalState);
      }
    }
  }, [faceLandmarker, onUpdate, isWarmingUp]);

  // 4. Effect to handle enabling/disabling the engine
  useEffect(() => {
    const startEngine = async () => {
      if (!faceLandmarker) return;
      onPermissionChange('pending');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        streamRef.current = stream;

        let video: HTMLVideoElement;
        if (videoEl) {
          video = videoEl;
        } else {
          video = document.createElement("video");
        }
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;
        video.autoplay = true;
        await video.play();
        videoRef.current = video;
        onPermissionChange('granted');
        requestRef.current = requestAnimationFrame(runPrediction);
      } catch (err) {
        console.error("Failed to get camera access:", err);
        onPermissionChange('denied');
      }
    };

    const stopEngine = () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current = null;
      }
    };

    if (enabled) {
      startEngine();
    } else {
      stopEngine();
    }
    return () => stopEngine();
  }, [enabled, faceLandmarker, onPermissionChange, runPrediction]);
}
