import { create } from 'zustand';

// 学習サマリーの型定義
interface Summary {
  mins: number; // 合計学習時間
  acc: number; // 平均正答率
  flow: number; // 集中度スコア
}

// ヒートマップのデータポイント
interface HeatmapPoint {
  date: string;
  count: number;
}

// 苦手・得意トレンドの項目
interface TrendItem {
  moduleId: string;
  moduleName: string;
  change: number; // e.g., +15%
}

interface AnalyticsState {
  summary: Summary | null;
  heatmap: HeatmapPoint[];
  trends: {
    topImprovements: TrendItem[];
    topDeclines: TrendItem[];
  } | null;
  setAnalyticsData: (data: Partial<AnalyticsState>) => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  summary: null,
  heatmap: [],
  trends: null,
  setAnalyticsData: (data) => set((state) => ({ ...state, ...data })),
}));
