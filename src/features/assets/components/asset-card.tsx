"use client";

import { CalendarPlus, Download, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Asset } from "@/types/domain";

export function AssetCard({ asset, onSave, onSchedule, busy }: { asset: Asset; onSave?: (asset: Asset) => void; onSchedule?: (asset: Asset) => void; busy?: boolean }) {
  const tone = asset.status === "saved" ? "success" : asset.status === "scheduled" ? "accent" : "neutral";
  const hasActions = Boolean(onSave || onSchedule);

  return (
    <motion.div className="h-full" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
      <Card className="flex h-full min-w-0 flex-col overflow-hidden">
        <div className={cn("relative h-40 shrink-0", asset.preview)}>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.48))]" />
          <Badge className="absolute left-4 top-4" tone={tone}>{asset.status}</Badge>
          <Sparkles className="absolute bottom-4 right-4 h-5 w-5 text-white/70" />
        </div>
        <div className="flex min-h-56 flex-1 flex-col p-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="min-w-0 flex-1 text-sm font-semibold text-text-primary">{asset.title}</h3>
              <Badge className="shrink-0" tone="primary">{asset.channel}</Badge>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-muted">{asset.prompt}</p>
          </div>
          {hasActions ? (
            <div className="mt-auto flex flex-wrap gap-2 pt-4">
              {onSave ? (
                <Button className="min-w-32 flex-1 whitespace-nowrap" variant="secondary" size="sm" onClick={() => onSave(asset)} disabled={busy}>
                  <Download className="h-4 w-4" /> Save
                </Button>
              ) : null}
              {onSchedule ? (
                <Button className="min-w-32 flex-1 whitespace-nowrap" variant="subtle" size="sm" onClick={() => onSchedule(asset)} disabled={busy}>
                  <CalendarPlus className="h-4 w-4" /> Schedule
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </Card>
    </motion.div>
  );
}
