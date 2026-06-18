import { create } from "zustand";
import type { Trend } from "@/lib/trend-data";

type TrendBriefState = {
  pinnedTrend: Trend | null;
  pinTrend: (trend: Trend) => void;
  dismissTrend: () => void;
  generatePromptFromTrend: (trend: Trend, template?: string) => string;
};

export const useTrendBriefStore = create<TrendBriefState>((set, get) => ({
  pinnedTrend: null,
  pinTrend: (trend) => set({ pinnedTrend: trend }),
  dismissTrend: () => set({ pinnedTrend: null }),
  
  generatePromptFromTrend: (trend: Trend, template?: string) => {
    const hashtags = trend.hashtags.join(" ");
    const baseTemplates = {
      default: `Create a ${trend.platform} post about "${trend.title}" for ${trend.niche} audience. Use these hashtags: ${hashtags}. Make it engaging and on-trend.`,
      image: `Design a ${trend.platform} visual for "${trend.title}". Style: modern, eye-catching, ${trend.niche}-focused. Include text overlay with the trend title. Use ${trend.niche} color palette.`,
      caption: `Write a ${trend.platform} caption for "${trend.title}". Target audience: ${trend.niche}. Tone: engaging, authentic, trend-aware. Include relevant hashtags: ${hashtags}`,
      carousel: `Create a ${trend.platform} carousel about "${trend.title}". 5 slides: hook, problem, solution, tips, CTA. Style: clean, informative, ${trend.niche}-relevant.`,
    };
    
    return template ? baseTemplates[template as keyof typeof baseTemplates] || baseTemplates.default : baseTemplates.default;
  },
}));
