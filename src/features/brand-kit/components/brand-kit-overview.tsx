"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { brandKitService } from "@/services";
import { queryKeys } from "@/services/query-keys";

export function BrandKitOverview() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.brandKits.list(),
    queryFn: () => brandKitService.list(),
  });

  if (isLoading) return <Skeleton className="h-64" />;

  const kit = data?.[0];
  if (!kit) {
    return (
      <EmptyState
        icon={Palette}
        title="No brand kit"
        description="Define a brand kit to keep AI generations on-brand."
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {kit.colors.map((c) => (
            <div key={c.hex} className="flex items-center gap-3">
              <span
                className="h-7 w-7 rounded-md border border-border"
                style={{ backgroundColor: c.hex }}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="font-mono text-xs text-muted-foreground">{c.hex}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Typography</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Heading</p>
            <p className="text-lg font-medium">{kit.typography.headingFont}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Body</p>
            <p>{kit.typography.bodyFont}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Voice</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-1.5">
            {kit.voice.tone.map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-xs capitalize text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Do</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-muted-foreground">
              {kit.voice.doList.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Don't</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-muted-foreground">
              {kit.voice.dontList.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
