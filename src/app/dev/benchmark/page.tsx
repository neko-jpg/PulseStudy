"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { PulseEngine, PulseEngineOutput } from "@/lib/pulse-engine";
import { PulseDebugUI } from "@/components/debug/PulseDebugUI";
import { InterventionOrchestrator, InterventionAction } from "@/lib/intervention-orchestrator";
import { GamificationEngine } from "@/lib/gamification-engine";
import { FocusNudge } from "@/components/common/FocusNudge";
import { telemetryService } from "@/lib/telemetry";

type BenchmarkStats = {
  p50: number;
  p95: number;
  fps: number;
};

// Utility function to calculate percentile
const getPercentile = (data: number[], percentile: number): number => {
  if (data.length === 0) return 0;
  data.sort((a, b) => a - b);
  const index = (percentile / 100) * (data.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) {
    return data[lower];
  }
  return data[lower] * (upper - index) + data[upper] * (index - lower);
};

const BenchmarkPage = () => {
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [stats, setStats] = useState<BenchmarkStats>({ p50: 0, p95: 0, fps: 0 });
  const [engineOutput, setEngineOutput] = useState<PulseEngineOutput | null>(null);
  const [intervention, setIntervention] = useState<InterventionAction | null>(null);
  const [points, setPoints] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>();
  const latenciesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const lastSampleTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const pulseEngineRef = useRef<PulseEngine | null>(null);
  const orchestratorRef = useRef<InterventionOrchestrator | null>(null);
  const gamificationEngineRef = useRef<GamificationEngine | null>(null);

  const createFaceLandmarker = useCallback(async () => {
    try {
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
    } catch (e: any) {
      setError(`Failed to create FaceLandmarker: ${e.message}`);
      console.error(e);
    }
  }, []);

  useEffect(() => {
    createFaceLandmarker();
    pulseEngineRef.current = new PulseEngine();
    orchestratorRef.current = new InterventionOrchestrator();
    gamificationEngineRef.current = new GamificationEngine();
  }, [createFaceLandmarker]);

  const predictWebcam = useCallback(() => {
    if (!videoRef.current || !faceLandmarker || !pulseEngineRef.current || !orchestratorRef.current || !gamificationEngineRef.current) return;

    const video = videoRef.current;
    if (video.readyState < 2) {
      requestRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const now = performance.now();
    const dt = (now - lastFrameTimeRef.current) / 1000;

    const results = faceLandmarker.detectForVideo(video, now);
    const latency = performance.now() - now;

    if (results && results.faceLandmarks.length > 0) {
      const output = pulseEngineRef.current.processFrame(results, video.currentTime);
      setEngineOutput(output);

      const action = orchestratorRef.current.getAction(output);
      setIntervention(action);

      gamificationEngineRef.current.update(output, dt);
      setPoints(gamificationEngineRef.current.totalPoints);

      // Log a sample periodically
      if (now - lastSampleTimeRef.current > 5000) { // every 5 seconds
        telemetryService.logSample({
          score: output.smoothedScore,
          attn: { gaze: output.features.gazeDeviation, audio: null, hr: null },
          quality: { light: 'good', fps: stats.fps } // Mocked light quality
        });
        lastSampleTimeRef.current = now;
      }
    }

    latenciesRef.current.push(latency);
    if (latenciesRef.current.length > 300) { // Keep last 10 seconds of data at 30fps
        latenciesRef.current.shift();
    }

    // Calculate FPS
    frameCountRef.current++;
    const elapsed = now - lastFrameTimeRef.current;
    if (elapsed > 1000) {
      const newFps = (frameCountRef.current * 1000) / elapsed;
      const newStats = {
          p50: getPercentile(latenciesRef.current, 50),
          p95: getPercentile(latenciesRef.current, 95),
          fps: newFps,
      };
      setStats(newStats);
      lastFrameTimeRef.current = now;
      frameCountRef.current = 0;
    }

    if (isBenchmarking) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
  }, [faceLandmarker, isBenchmarking, stats.fps]);

  const handleStart = async () => {
    if (!faceLandmarker) {
      setError("FaceLandmarker not ready. Please wait.");
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("getUserMedia is not supported by your browser.");
      return;
    }

    setIsBenchmarking(true);
    latenciesRef.current = [];
    gamificationEngineRef.current?.reset();
    setPoints(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", () => {
            lastFrameTimeRef.current = performance.now();
            requestRef.current = requestAnimationFrame(predictWebcam);
        });
      }
    } catch (err: any) {
      setError(`Failed to access webcam: ${err.message}`);
      setIsBenchmarking(false);
    }
  };

  const handleStop = () => {
    setIsBenchmarking(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const nudgeActive = intervention?.type === 'SHOW_FOCUS_NUDGE';

  return (
    <FocusNudge isActive={nudgeActive}>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
        <div className="w-full max-w-6xl">
          <h1 className="text-3xl font-bold text-center mb-4">Pulse Engine - Dev Panel</h1>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <div className="relative w-full aspect-video bg-black rounded overflow-hidden self-start">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  {!isBenchmarking && <div className="absolute inset-0 flex items-center justify-center text-gray-400">Camera off</div>}
                </div>
                 <div>
                  {!isBenchmarking ? (
                    <button
                      onClick={handleStart}
                      disabled={!faceLandmarker}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      {!faceLandmarker ? 'Loading Model...' : 'Start Benchmark'}
                    </button>
                  ) : (
                    <button
                      onClick={handleStop}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded"
                    >
                      Stop Benchmark
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                    <h2 className="text-xl font-semibold mb-3 text-center">Focus Points</h2>
                    <p className="text-4xl font-mono text-amber-400 text-center">{points.toFixed(0)}</p>
                </div>
                 <div>
                  <h2 className="text-xl font-semibold mb-3">Performance Stats</h2>
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${stats.fps >= 25 ? 'bg-green-800' : 'bg-yellow-800'}`}>
                      <p className="text-sm text-green-200">Frames Per Second (FPS)</p>
                      <p className="text-2xl font-mono">{stats.fps.toFixed(1)}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stats.p50 <= 120 ? 'bg-green-800' : 'bg-red-800'}`}>
                      <p className="text-sm text-green-200">p50 Latency (ms)</p>
                      <p className="text-2xl font-mono">{stats.p50.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">Target: ≤ 120ms</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stats.p95 <= 200 ? 'bg-green-800' : 'bg-red-800'}`}>
                      <p className="text-sm text-green-200">p95 Latency (ms)</p>
                      <p className="text-2xl font-mono">{stats.p95.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">Target: ≤ 200ms</p>
                    </div>
                  </div>
                </div>
                <PulseDebugUI engineOutput={engineOutput} />
              </div>
            </div>
            {error && <div className="mt-4 text-red-400 bg-red-900 p-3 rounded">{error}</div>}
             <div className="mt-6 text-xs text-gray-500">
                <p>This tool measures the performance of running the MediaPipe Face Landmarker model on your device. It captures video from your webcam, runs the model on each frame, and displays the processing latency and frames per second (FPS). This helps verify if the device meets the technical SLOs for the Pulse feature.</p>
             </div>
          </div>
        </div>
      </div>
    </FocusNudge>
  );
};

export default BenchmarkPage;
