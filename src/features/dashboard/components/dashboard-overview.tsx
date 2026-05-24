"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Megaphone, Sparkles, Library, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { campaignsService, assetsService, schedulerService } from "@/services";
import { queryKeys } from "@/services/query-keys";

export function DashboardOverview() {
  const campaigns = useQuery({
    queryKey: queryKeys.campaigns.list(),
    queryFn: () => campaignsService.list(),
  });
  const assets = useQuery({
    queryKey: queryKeys.assets.list(),
    queryFn: () => assetsService.list(),
  });
  const scheduled = useQuery({
    queryKey: queryKeys.scheduled.list(),
    queryFn: () => schedulerService.list(),
  });

  const stats = [
    {
      label: "Active campaigns",
      value: campaigns.data?.filter((c) => c.status === "active").length ?? 0,
      icon: Megaphone,
    },
    {
      label: "Assets in library",
      value: assets.data?.length ?? 0,
      icon: Library,
    },
    {
      label: "Scheduled posts",
      value: scheduled.data?.length ?? 0,
      icon: CalendarDays,
    },
    {
      label: "Generations this week",
      value: 12,
      icon: Sparkles,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {s.label}
              </div>
              <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
                {s.value}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
