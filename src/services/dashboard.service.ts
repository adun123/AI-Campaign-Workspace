import { listAssets } from "@/services/asset.service";
import { listScheduledPosts } from "@/services/scheduler.service";
import { waitForMock } from "@/services/mock-runtime";

export type DashboardSummaryMetric = {
  label: "Assets" | "Scheduled" | "Readiness";
  value: string;
};

export type DashboardSummary = {
  metrics: DashboardSummaryMetric[];
};

function calculateReadinessPercent(assetCount: number, scheduledCount: number) {
  const assetScore = Math.min(assetCount, 5) * 12;
  const scheduleScore = Math.min(scheduledCount, 3) * 10;
  const foundationScore = 6;
  return Math.min(100, assetScore + scheduleScore + foundationScore);
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await waitForMock(180);
  const [assets, scheduledPosts] = await Promise.all([listAssets(), listScheduledPosts()]);
  const readinessPercent = calculateReadinessPercent(assets.length, scheduledPosts.length);

  return {
    metrics: [
      { label: "Assets", value: String(assets.length) },
      { label: "Scheduled", value: String(scheduledPosts.length) },
      { label: "Readiness", value: `${readinessPercent}%` },
    ],
  };
}
