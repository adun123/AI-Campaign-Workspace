import type { AIGeneration, CampaignChannel, GenerationMode, ID } from "@/types/domain";

export type GenerationRequest = {
  campaignId: ID;
  mode: GenerationMode | "caption";
  prompt: string;
  channel?: CampaignChannel;
  sourceAssetId?: ID;
  images?: string[];
  aspectRatio?: string;
};

export async function listGenerations(campaignId: ID): Promise<AIGeneration[]> {
  const res = await fetch(`/api/generate?campaign_id=${campaignId}`);
  if (!res.ok) throw new Error("Gagal mengambil generations.");

  const data = await res.json();

  // Transform API response to match frontend type
  return data.map((gen: Record<string, unknown>) => ({
    id: gen.id,
    campaignId: gen.campaign_id,
    mode: gen.mode,
    prompt: gen.prompt,
    status: gen.status,
    sourceAssetId: gen.source_asset_id,
    createdAt: gen.created_at,
    completedAt: gen.completed_at,
    errorMessage: gen.error_message,
    outputAssets: (gen.generation_outputs as Array<{ assets: Record<string, unknown> }>)?.map((go) => ({
      id: go.assets.id,
      campaignId: go.assets.campaign_id,
      title: go.assets.title,
      kind: go.assets.kind,
      prompt: go.assets.prompt,
      preview: go.assets.preview,
      channel: go.assets.channel,
      status: go.assets.status,
      createdAt: go.assets.created_at,
    })) ?? [],
  }));
}

export async function generateAssets(request: GenerationRequest): Promise<AIGeneration> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      campaign_id: request.campaignId,
      mode: request.mode,
      prompt: request.prompt,
      channel: request.channel,
      source_asset_id: request.sourceAssetId,
      images: request.images,
      aspect_ratio: request.aspectRatio,
    }),
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error ?? "Gagal generate.");
  }

  const { generation } = await res.json();

  // Transform API response to match frontend type
  return {
    id: generation.id,
    campaignId: generation.campaign_id,
    mode: generation.mode,
    prompt: generation.prompt,
    status: generation.status,
    sourceAssetId: generation.source_asset_id,
    createdAt: generation.created_at,
    completedAt: generation.completed_at,
    errorMessage: generation.error_message,
    outputAssets: generation.outputAssets ?? [],
  };
}

export async function deleteGeneration(id: ID): Promise<void> {
  const res = await fetch(`/api/generate/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus generation.");
}
