import { trends, type Trend, type TrendNiche, type TrendPlatform } from "@/lib/trend-data";
import { waitForMock } from "@/services/mock-runtime";

export type TrendFilter = {
  platform?: TrendPlatform;
  niches: TrendNiche[];
};

export async function discoverTrends(filter: TrendFilter): Promise<Trend[]> {
  await waitForMock(400);
  return trends.filter((t) => {
    if (filter.platform && t.platform !== filter.platform) return false;
    if (filter.niches.length > 0 && !filter.niches.includes(t.niche)) return false;
    return true;
  });
}
