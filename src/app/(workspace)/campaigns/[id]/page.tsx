"use client";

import { use } from "react";
import { CampaignWorkspace } from "@/features/campaigns/campaign-workspace";

export default function CampaignWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CampaignWorkspace campaignId={id} />;
}
