import type { ID } from "@/types/domain";

export type TrendPlatform = "Instagram" | "TikTok" | "Facebook" | "X" | "LinkedIn" | "YouTube Shorts";

export type TrendNiche =
  | "Beauty & Skincare"
  | "Tech & Gadget"
  | "Marketing & Branding"
  | "Sales & E-commerce"
  | "Food & Lifestyle"
  | "Health & Fitness"
  | "Education"
  | "Finance";

export type TrendLevel = "high" | "rising" | "emerging";

export type Trend = {
  id: ID;
  title: string;
  platform: TrendPlatform;
  niche: TrendNiche;
  hashtags: string[];
  level: TrendLevel;
};

export const trendPlatforms: TrendPlatform[] = ["Instagram", "TikTok", "Facebook", "X", "LinkedIn", "YouTube Shorts"];

export const trendNiches: TrendNiche[] = [
  "Beauty & Skincare",
  "Tech & Gadget",
  "Marketing & Branding",
  "Sales & E-commerce",
  "Food & Lifestyle",
  "Health & Fitness",
  "Education",
  "Finance",
];

export const trends: Trend[] = [
  { id: "trend_01", title: "POV: skincare routine yang bikin glowing dalam 7 hari", platform: "TikTok", niche: "Beauty & Skincare", hashtags: ["#glowup", "#skincareroutine", "#cleanbeauty"], level: "high" },
  { id: "trend_02", title: "AI tools yang bikin kerjaan 5 jam jadi 30 menit", platform: "LinkedIn", niche: "Tech & Gadget", hashtags: ["#AItools", "#productivity", "#futureofwork"], level: "high" },
  { id: "trend_03", title: "Hook copywriting yang convert: before vs after framework", platform: "Instagram", niche: "Marketing & Branding", hashtags: ["#copywriting", "#marketingtips", "#contentcreator"], level: "rising" },
  { id: "trend_04", title: "Cara jualan tanpa hard-sell: storytelling approach", platform: "TikTok", niche: "Sales & E-commerce", hashtags: ["#jualanonline", "#storytelling", "#softselltips"], level: "high" },
  { id: "trend_05", title: "Resep 15 menit yang aesthetic buat content", platform: "Instagram", niche: "Food & Lifestyle", hashtags: ["#foodcontent", "#aesthetic", "#quickrecipe"], level: "rising" },
  { id: "trend_06", title: "Morning routine founder yang produktif tanpa hustle culture", platform: "YouTube Shorts", niche: "Health & Fitness", hashtags: ["#morningroutine", "#founderslife", "#wellness"], level: "emerging" },
  { id: "trend_07", title: "Micro-course format: teach one thing in 60 seconds", platform: "TikTok", niche: "Education", hashtags: ["#learnontiktok", "#microcourse", "#edutok"], level: "high" },
  { id: "trend_08", title: "Budgeting challenge: 30 hari tanpa impulse buying", platform: "Facebook", niche: "Finance", hashtags: ["#budgetingchallenge", "#financetips", "#savingmoney"], level: "rising" },
  { id: "trend_09", title: "Dewy makeup look dengan produk lokal under 100k", platform: "TikTok", niche: "Beauty & Skincare", hashtags: ["#dewymakeup", "#produklokal", "#makeupmurah"], level: "rising" },
  { id: "trend_10", title: "SaaS demo video format yang bikin orang stay sampai akhir", platform: "LinkedIn", niche: "Tech & Gadget", hashtags: ["#SaaS", "#productdemo", "#B2Bmarketing"], level: "emerging" },
  { id: "trend_11", title: "Carousel format: 5 slides yang educate + convert", platform: "Instagram", niche: "Marketing & Branding", hashtags: ["#carouseltips", "#instagramgrowth", "#contentmarketing"], level: "high" },
  { id: "trend_12", title: "Live selling strategy: flash sale + countdown timer", platform: "Facebook", niche: "Sales & E-commerce", hashtags: ["#liveselling", "#flashsale", "#ecommercetips"], level: "rising" },
  { id: "trend_13", title: "Desk setup minimalis untuk WFH productivity", platform: "YouTube Shorts", niche: "Tech & Gadget", hashtags: ["#desksetup", "#minimalist", "#WFH"], level: "emerging" },
  { id: "trend_14", title: "Thread format: breakdown strategi growth dari 0 ke 10k followers", platform: "X", niche: "Marketing & Branding", hashtags: ["#growthstrategy", "#threadtips", "#socialmedia"], level: "high" },
  { id: "trend_15", title: "Meal prep sehat untuk seminggu dalam 2 jam", platform: "Instagram", niche: "Food & Lifestyle", hashtags: ["#mealprep", "#healthyfood", "#contentideas"], level: "emerging" },
];
