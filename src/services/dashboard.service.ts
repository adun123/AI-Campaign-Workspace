export type DashboardSummaryMetric = {
  label: "Assets" | "Scheduled" | "Campaigns" | "Readiness";
  value: string;
};

export type DashboardSummary = {
  metrics: DashboardSummaryMetric[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch("/api/dashboard/summary");
  if (!res.ok) throw new Error("Gagal mengambil dashboard summary.");
  return res.json();
}
