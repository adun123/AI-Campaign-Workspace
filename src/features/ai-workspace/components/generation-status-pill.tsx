"use client";

import * as React from "react";
import { Loader2, CheckCircle2, AlertTriangle, Clock, Ban } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AIGeneration } from "@/types";

const COPY: Record<AIGeneration["status"], { label: string; tone: string }> = {
  idle: { label: "Idle", tone: "text-muted-foreground" },
  queued: { label: "Queued", tone: "text-muted-foreground" },
  running: { label: "Generating", tone: "text-accent" },
  streaming: { label: "Streaming", tone: "text-accent" },
  succeeded: { label: "Ready", tone: "text-success" },
  failed: { label: "Failed", tone: "text-destructive" },
  cancelled: { label: "Cancelled", tone: "text-muted-foreground" },
};

export function GenerationStatusPill({ generation }: { generation: AIGeneration }) {
  const { status } = generation;
  const meta = COPY[status];

  const Icon =
    status === "succeeded"
      ? CheckCircle2
      : status === "failed"
        ? AlertTriangle
        : status === "cancelled"
          ? Ban
          : status === "queued"
            ? Clock
            : Loader2;

  const isAnimated = status === "running" || status === "streaming";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs",
        meta.tone,
      )}
      role="status"
      aria-live="polite"
    >
      <Icon className={cn("h-3.5 w-3.5", isAnimated && "animate-spin")} />
      <span>{meta.label}</span>
      {typeof generation.progress === "number" && isAnimated ? (
        <span className="text-muted-foreground">· {Math.round(generation.progress * 100)}%</span>
      ) : null}
    </div>
  );
}
