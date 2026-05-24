"use client";

import * as React from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck, CalendarPlus, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { assetsService } from "@/services";
import { queryKeys } from "@/services/query-keys";
import type { AIGeneration, Asset } from "@/types";

interface GeneratedAssetGridProps {
  generation: AIGeneration;
}

export function GeneratedAssetGrid({ generation }: GeneratedAssetGridProps) {
  const isLoadingPlaceholders =
    generation.status === "queued" ||
    generation.status === "running" ||
    generation.status === "streaming";

  const { data: assets } = useQuery({
    queryKey: ["assets", "by-generation", generation.id],
    queryFn: async () => {
      const all = await Promise.all(
        generation.resultAssetIds.map((id) => assetsService.get(id)),
      );
      return all.filter((a): a is Asset => a != null);
    },
    enabled: generation.resultAssetIds.length > 0,
  });

  if (isLoadingPlaceholders) {
    const count = generation.params.options?.variations ?? 2;
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "aspect-square w-full",
              generation.params.outputType !== "image" &&
                generation.params.outputType !== "video" &&
                "aspect-auto h-32",
            )}
          />
        ))}
      </div>
    );
  }

  if (!assets || assets.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {assets.map((asset, i) => (
        <motion.div
          key={asset.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
        >
          <GeneratedAssetCard asset={asset} />
        </motion.div>
      ))}
    </div>
  );
}

function GeneratedAssetCard({ asset }: { asset: Asset }) {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (saved: boolean) => assetsService.update(asset.id, { saved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      queryClient.invalidateQueries({ queryKey: ["assets", "by-generation"] });
    },
  });

  const isVisual = asset.type === "image" || asset.type === "video";

  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-primary/30">
      {isVisual && asset.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={asset.url}
          alt={asset.title}
          className="aspect-square w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="p-5">
          <p className="text-sm leading-relaxed text-foreground">{asset.content}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
        <p className="truncate text-xs text-muted-foreground" title={asset.title}>
          {asset.title}
        </p>
        <div className="flex shrink-0 items-center gap-0.5">
          {!isVisual ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Copy"
              onClick={() => {
                if (asset.content) navigator.clipboard?.writeText(asset.content);
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Schedule"
            title="Schedule"
          >
            <CalendarPlus className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={asset.saved ? "Unsave" : "Save to library"}
            onClick={() => saveMutation.mutate(!asset.saved)}
            disabled={saveMutation.isPending}
            className={cn(asset.saved && "text-primary")}
          >
            {asset.saved ? (
              <BookmarkCheck className="h-3.5 w-3.5" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
