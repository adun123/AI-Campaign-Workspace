"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Library } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { assetsService, type AssetsListFilter } from "@/services";
import { queryKeys } from "@/services/query-keys";
import { formatRelative } from "@/lib/format";
import type { Asset } from "@/types";

export function AssetGrid({ filter }: { filter?: AssetsListFilter }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.assets.list(filter),
    queryFn: () => assetsService.list(filter),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={Library}
        title="No assets here"
        description="Generated and saved assets land in your library."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {data.map((asset) => (
        <AssetThumb key={asset.id} asset={asset} />
      ))}
    </div>
  );
}

function AssetThumb({ asset }: { asset: Asset }) {
  const isVisual = asset.type === "image" || asset.type === "video";
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-primary/30">
      {isVisual && asset.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset.thumbnailUrl ?? asset.url}
          alt={asset.title}
          className="aspect-square w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="aspect-square overflow-hidden p-4">
          <p className="line-clamp-6 text-sm text-foreground">{asset.content}</p>
        </div>
      )}
      <div className="space-y-1.5 border-t border-border px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium text-foreground">{asset.title}</p>
          <Badge variant="outline" className="capitalize">
            {asset.type}
          </Badge>
        </div>
        <p className="text-[11px] text-muted-foreground">{formatRelative(asset.updatedAt)}</p>
      </div>
    </article>
  );
}
