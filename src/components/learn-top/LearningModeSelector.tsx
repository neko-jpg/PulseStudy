import { LearningMode } from '@/store/learnSettingsStore';

type LearningModeSelectorProps = {
  currentMode: LearningMode;
  onModeChange: (mode: LearningMode) => void;
};

export function LearningModeSelector({ currentMode, onModeChange }: LearningModeSelectorProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl">
      <h3 className="font-bold text-xl mb-4">学習モードの選択</h3>
      <div className="space-y-4">
        <button
          onClick={() => onModeChange('normal')}
          className={`w-full text-left p-4 rounded-lg transition-colors ${
            currentMode === 'normal'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          通常学習
        </button>
        <button
          onClick={() => onModeChange('focus')}
          className={`w-full text-left p-4 rounded-lg transition-colors ${
            currentMode === 'focus'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          集中モード
        </button>
      </div>
    </div>
  );
}
