"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import { campaignsService } from "@/services";
import { queryKeys } from "@/services/query-keys";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { CampaignCard } from "./campaign-card";

export function CampaignsGrid() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.campaigns.list(),
    queryFn: () => campaignsService.list(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No campaigns yet"
        description="Create your first campaign to start producing AI-assisted content."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.map((c) => (
        <CampaignCard key={c.id} campaign={c} />
      ))}
    </div>
  );
}
