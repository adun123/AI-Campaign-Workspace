"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, MoreHorizontal, Share2, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusDot } from "@/components/shared/status-dot";
import { useUIStore } from "@/stores/ui.store";
import type { Campaign } from "@/types";

const STATUS_TONE = {
  draft: "muted",
  active: "active",
  paused: "warning",
  archived: "muted",
} as const;

export function WorkspaceHeader({ campaign }: { campaign: Campaign }) {
  const togglePanel = useUIStore((s) => s.togglePropertiesPanel);

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-6">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href="/campaigns" aria-label="Back to campaigns">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ backgroundColor: campaign.coverColor ?? "#7C3AED" }}
            aria-hidden
          />
          <h1 className="truncate text-sm font-semibold text-foreground">{campaign.name}</h1>
          <Badge variant="outline" className="ml-1 capitalize">
            <StatusDot tone={STATUS_TONE[campaign.status]} className="mr-1.5" />
            {campaign.status}
          </Badge>
        </div>

        <Separator orientation="vertical" className="mx-1 h-5" />

        <div className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
          <span className="capitalize">{campaign.objective}</span>
          <span>·</span>
          <span>{campaign.channels.length} channels</span>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Toggle properties panel" onClick={togglePanel}>
            <PanelRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="More options">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
