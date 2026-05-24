import { notFound } from "next/navigation";
import { campaignsService } from "@/services";
import { CampaignWorkspace } from "@/features/ai-workspace";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignWorkspacePage({ params }: PageProps) {
  const { id } = await params;
  const campaign = await campaignsService.get(id);
  if (!campaign) notFound();
  return <CampaignWorkspace campaign={campaign} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const campaign = await campaignsService.get(id);
  return { title: campaign ? `${campaign.name} · Workspace` : "Workspace" };
}
