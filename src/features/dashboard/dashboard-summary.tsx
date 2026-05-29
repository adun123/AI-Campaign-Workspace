"use client";

import { BarChart3, Layers, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDashboardSummaryQuery } from "@/hooks/use-workspace-data";

const icons = {
  Assets: Layers,
  Scheduled: Send,
  Readiness: BarChart3,
};

export function DashboardSummary() {
  const summaryQuery = useDashboardSummaryQuery();
  const items = summaryQuery.data?.metrics ?? [
    { label: "Assets", value: "..." },
    { label: "Scheduled", value: "..." },
    { label: "Readiness", value: "..." },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map((item) => {
        const Icon = icons[item.label];
        return (
        <Card key={item.label} className="p-4">
          <Icon className="h-4 w-4 text-accent" />
          <p className="mt-3 text-2xl font-semibold text-text-primary">{item.value}</p>
          <p className="text-sm text-text-muted">{item.label}</p>
        </Card>
        );
      })}
    </div>
  );
}
