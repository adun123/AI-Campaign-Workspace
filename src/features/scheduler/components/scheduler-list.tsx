"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { schedulerService } from "@/services";
import { queryKeys } from "@/services/query-keys";
import { formatDateTime } from "@/lib/format";
import { StatusDot } from "@/components/shared/status-dot";

const STATUS_TONE = {
  draft: "muted",
  scheduled: "active",
  publishing: "warning",
  published: "active",
  failed: "danger",
} as const;

export function SchedulerList() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.scheduled.list(),
    queryFn: () => schedulerService.list(),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nothing scheduled"
        description="Schedule a generated asset to a channel to see it here."
      />
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
      {data.map((post) => (
        <li key={post.id} className="flex items-center gap-4 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {post.caption ?? `Scheduled ${post.channel} post`}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(post.scheduledFor)} · <span className="capitalize">{post.channel}</span>
            </p>
          </div>
          <Badge variant="outline" className="capitalize">
            <StatusDot tone={STATUS_TONE[post.status]} className="mr-1.5" />
            {post.status}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
