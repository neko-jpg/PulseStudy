"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { PulseEngine, type PulseEngineOutput } from "@/lib/pulse-engine";
import { CameraPermission } from "@/store/homeStore";

type UsePulseEngineProps = {
  enabled: boolean;
  onUpdate: (output: PulseEngineOutput) => void;
  onPermissionChange: (status: CameraPermission) => void;
};

export function usePulseEngine({ enabled, onUpdate, onPermissionChange }: UsePulseEngineProps) {
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const requestRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const pulseEngineRef = useRef<PulseEngine | null>(null);

  // 1. Initialize FaceLandmarker and PulseEngine
  const setup = useCallback(async () => {
    try {
      if (pulseEngineRef.current) return; // Already initialized

      pulseEngineRef.current = new PulseEngine();
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm"
      );
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU",
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1,
        outputFacialTransformationMatrixes: true,
      });
      setFaceLandmarker(landmarker);
    } catch (e) {
      console.error("Failed to initialize Pulse Engine:", e);
      onPermissionChange('denied'); // Treat setup failure as a denial for simplicity
    }
  }, [onPermissionChange]);

  useEffect(() => {
    setup();
  }, [setup]);


  // 2. Main processing loop
  const runPrediction = useCallback(() => {
    if (!videoRef.current || !faceLandmarker || !pulseEngineRef.current) {
      return;
    }
    const video = videoRef.current;
    if (video.readyState < 2) { // Ensure video is ready
        requestRef.current = requestAnimationFrame(runPrediction);
        return;
    }

    const results = faceLandmarker.detectForVideo(video, performance.now());
    if (results && results.faceLandmarks) {
        const output = pulseEngineRef.current.processFrame(results, Date.now());
        onUpdate(output);
    }

    requestRef.current = requestAnimationFrame(runPrediction);
  }, [faceLandmarker, onUpdate]);


  // 3. Effect to handle enabling/disabling the engine
  useEffect(() => {
    const startEngine = async () => {
      if (!faceLandmarker) {
          // Model not loaded yet, wait.
          return;
      }
      onPermissionChange('pending');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        streamRef.current = stream;

        // Create a temporary video element to play the stream
        const video = document.createElement("video");
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true; // Mute to avoid audio playback
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
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
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

    // Cleanup function
    return () => {
      stopEngine();
    };
  }, [enabled, faceLandmarker, onPermissionChange, runPrediction]);

  // No need to return anything as this is a "controller" hook
}
