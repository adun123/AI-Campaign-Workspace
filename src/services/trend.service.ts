import type { Trend, TrendNiche, TrendPlatform } from "@/lib/trend-data";

export type TrendFilter = {
  platform?: TrendPlatform;
  niches: TrendNiche[];
  country?: string;
  period?: 7 | 30 | 120;
};

export async function discoverTrends(filter: TrendFilter): Promise<Trend[]> {
  const res = await fetch("/api/trends/discover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      platform: filter.platform || null,
      niches: filter.niches,
      country: filter.country || "ID",
      period: filter.period || 7,
    }),
  });

  if (!res.ok) {
    console.error("[Trend Service] API error:", res.status);
    throw new Error("Failed to fetch trends");
  }

  const data = await res.json();
  return data.trends || [];
}
