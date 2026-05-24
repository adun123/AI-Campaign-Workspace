"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusDot } from "@/components/shared/status-dot";
import { formatRelative } from "@/lib/format";
import type { Campaign } from "@/types";

const STATUS_TONE = {
  draft: "muted",
  active: "active",
  paused: "warning",
  archived: "muted",
} as const;

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Link href={`/campaigns/${campaign.id}/workspace`} className="block group">
      <Card className="relative overflow-hidden p-0 transition-colors group-hover:border-primary/30">
        <div
          className="h-1 w-full"
          style={{ backgroundColor: campaign.coverColor ?? "#7C3AED" }}
          aria-hidden
        />
        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-medium text-foreground">{campaign.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {campaign.description}
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="capitalize">
              <StatusDot tone={STATUS_TONE[campaign.status]} className="mr-1.5" />
              {campaign.status}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {campaign.objective}
            </Badge>
            {campaign.channels.slice(0, 3).map((c) => (
              <Badge key={c} variant="outline" className="capitalize">
                {c}
              </Badge>
            ))}
            {campaign.channels.length > 3 ? (
              <span className="text-xs text-muted-foreground">
                +{campaign.channels.length - 3}
              </span>
            ) : null}
          </div>

          <p className="text-xs text-muted-foreground">
            Updated {formatRelative(campaign.updatedAt)}
          </p>
        </div>
      </Card>
    </Link>
  );
}
