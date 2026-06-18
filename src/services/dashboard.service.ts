export type DashboardSummaryMetric = {
  label: "Assets" | "Scheduled" | "Campaigns" | "Readiness" | "Generations";
  value: string;
};

export type DashboardSummary = {
  metrics: DashboardSummaryMetric[];
  readiness: number;
  estimatedCost: string;
  channelBreakdown: Record<string, number>;
  recentAssets: {
    id: string;
    title: string;
    kind: string;
    channel: string;
    preview: string;
    created_at: string;
  }[];
  recentGenerations: {
    id: string;
    mode: string;
    prompt: string;
    status: string;
    created_at: string;
  }[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch("/api/dashboard/summary");
  if (!res.ok) throw new Error("Gagal mengambil dashboard summary.");
  return res.json();
}
