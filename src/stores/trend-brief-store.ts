import { create } from "zustand";
import type { Trend } from "@/lib/trend-data";

type TrendBriefState = {
  pinnedTrend: Trend | null;
  pinTrend: (trend: Trend) => void;
  dismissTrend: () => void;
};

export const useTrendBriefStore = create<TrendBriefState>((set) => ({
  pinnedTrend: null,
  pinTrend: (trend) => set({ pinnedTrend: trend }),
  dismissTrend: () => set({ pinnedTrend: null }),
}));
