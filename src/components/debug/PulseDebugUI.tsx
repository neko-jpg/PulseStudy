"use client";

import { PulseEngineOutput } from "@/lib/pulse-engine";

interface Props {
  engineOutput: PulseEngineOutput | null;
}

const ProgressBar = ({ value, max, label }: { value: number; max: number; label: string }) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm font-medium text-gray-300">{value.toFixed(2)}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};


export const PulseDebugUI = ({ engineOutput }: Props) => {
  if (!engineOutput) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-gray-400">
        Awaiting Pulse Engine output...
      </div>
    );
  }

  const { rawScore, smoothedScore, features, events } = engineOutput;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-white text-center">Pulse Engine - Debug Panel</h2>

      {/* Scores Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-cyan-400 mb-2">Scores</h3>
        <div className="flex justify-around bg-gray-700 p-3 rounded-lg">
          <div>
            <p className="text-sm text-gray-400">Raw</p>
            <p className="text-2xl font-mono text-white">{rawScore.toFixed(3)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Smoothed</p>
            <p className="text-2xl font-mono text-green-400">{smoothedScore.toFixed(3)}</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-cyan-400 mb-2">Live Features</h3>
        <div className="space-y-3">
          <ProgressBar value={features.gazeDeviation} max={1} label="Gaze Deviation" />
          <ProgressBar value={features.browDown} max={1} label="Brow Down (Confusion)" />
          <div>
             <p className="text-sm font-medium text-gray-300">Head Pose (deg)</p>
             <p className="text-sm font-mono text-gray-400">
                Pitch: {features.headPitch.toFixed(1)},
                Yaw: {features.headYaw.toFixed(1)},
                Roll: {features.headRoll.toFixed(1)}
             </p>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div>
        <h3 className="text-lg font-bold text-cyan-400 mb-2">Triggered Events</h3>
        <div className="bg-gray-700 p-3 rounded-lg min-h-[50px] text-gray-300">
          {events.length > 0 ? (
            <ul>
              {events.map((event, index) => (
                <li key={index} className="font-mono text-yellow-400">
                  {new Date(event.timestamp).toLocaleTimeString()}: {event.type}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">No events triggered.</p>
          )}
        </div>
      </div>
    </div>
  );
};
