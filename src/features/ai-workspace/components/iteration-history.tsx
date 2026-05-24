"use client";

import * as React from "react";
import { History } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatRelative, truncate } from "@/lib/format";
import type { AIGeneration, ID } from "@/types";
import { GenerationStatusPill } from "./generation-status-pill";

interface IterationHistoryProps {
  history: AIGeneration[];
  currentId: ID | null;
  onSelect: (id: ID) => void;
}

export function IterationHistory({ history, currentId, onSelect }: IterationHistoryProps) {
  return (
    <aside
      className="hidden w-[260px] shrink-0 border-r border-border bg-surface/40 lg:flex lg:flex-col"
      aria-label="Iteration history"
    >
      <div className="flex h-12 items-center gap-2 border-b border-border px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <History className="h-3.5 w-3.5" />
        Iterations
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {history.length === 0 ? (
          <p className="px-2 py-4 text-xs text-muted-foreground">
            Nothing yet. Generate to start a thread.
          </p>
        ) : (
          <ul className="space-y-1">
            {history.map((g) => {
              const active = g.id === currentId;
              return (
                <li key={g.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(g.id)}
                    className={cn(
                      "w-full rounded-md border border-transparent px-2.5 py-2 text-left transition-colors",
                      active
                        ? "border-border bg-surface"
                        : "hover:bg-surface/80",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {g.params.outputType}
                      </span>
                      <GenerationStatusPill generation={g} />
                    </div>
                    <p className="mt-1.5 text-xs text-foreground">
                      {truncate(g.params.prompt, 80)}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatRelative(g.createdAt)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
