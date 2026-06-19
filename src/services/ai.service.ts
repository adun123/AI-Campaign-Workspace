import type { AIGeneration, Asset, CampaignChannel, GenerationMode, ID } from "@/types/domain";
import type { StylePreset } from "@/stores/chat-store";

export type GenerationRequest = {
  campaignId: ID;
  mode: GenerationMode | "caption";
  prompt: string;
  channel?: CampaignChannel;
  sourceAssetId?: ID;
  images?: string[];
  aspectRatio?: string;
  batchCount?: 1 | 2 | 4;
  stylePreset?: StylePreset;
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
      num_images: request.batchCount ?? 1,
      style_preset: request.stylePreset ?? "none",
    }),
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error ?? "Gagal generate.");
  }

  const json = (await res.json()) as Record<string, unknown>;
  const generation = json.generation as Record<string, unknown>;

  // Transform API response to match frontend type
  return {
    id: generation.id as string,
    campaignId: generation.campaign_id as string,
    mode: generation.mode as string,
    prompt: generation.prompt as string,
    status: generation.status as string,
    sourceAssetId: generation.source_asset_id as string | undefined,
    createdAt: generation.created_at as string,
    completedAt: generation.completed_at as string | undefined,
    errorMessage: generation.error_message as string | undefined,
    outputAssets: (generation.outputAssets as Asset[]) ?? [],
    enhancedPrompt: generation.enhancedPrompt as string | undefined,
  } as AIGeneration;
}

export async function deleteGeneration(id: ID): Promise<void> {
  const res = await fetch(`/api/generate/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus generation.");
}
