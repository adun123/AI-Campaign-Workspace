"use client";

import { useQuery } from "@tanstack/react-query";
import { getActiveCampaign } from "@/services/campaign.service";
import { getSession } from "@/services/auth.service";
import { listAssets } from "@/services/asset.service";
import { listGenerations } from "@/services/ai.service";
import { listScheduledPosts } from "@/services/scheduler.service";
import { getActiveBrandKit } from "@/services/brand-kit.service";
import { getDashboardSummary } from "@/services/dashboard.service";

export function useSessionQuery() {
  return useQuery({ queryKey: ["session"], queryFn: getSession });
}

export function useActiveCampaignQuery() {
  return useQuery({ queryKey: ["active-campaign"], queryFn: getActiveCampaign });
}

export function useAssetsQuery(campaignId?: string) {
  return useQuery({
    queryKey: ["assets", campaignId],
    queryFn: () => listAssets(campaignId),
  });
}

export function useGenerationsQuery(campaignId?: string) {
  return useQuery({
    queryKey: ["generations", campaignId],
    queryFn: () => listGenerations(campaignId ?? ""),
    enabled: Boolean(campaignId),
  });
}

export function useScheduledPostsQuery() {
  return useQuery({ queryKey: ["scheduled-posts"], queryFn: listScheduledPosts });
}

export function useActiveBrandKitQuery(workspaceId?: string) {
  return useQuery({
    queryKey: ["brand-kit", workspaceId],
    queryFn: () => getActiveBrandKit(workspaceId),
  });
}

export function useDashboardSummaryQuery() {
  return useQuery({ queryKey: ["dashboard-summary"], queryFn: getDashboardSummary });
}
