import * as React from "react";
import { cn } from "@/lib/cn";

type StatusTone = "neutral" | "active" | "warning" | "danger" | "muted";

const TONES: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground",
  active: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  muted: "bg-border",
};

export function StatusDot({
  tone = "neutral",
  className,
}: {
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex h-2 w-2 rounded-full",
        TONES[tone],
        tone === "active" && "after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-success/60",
        className,
      )}
    />
  );
}
