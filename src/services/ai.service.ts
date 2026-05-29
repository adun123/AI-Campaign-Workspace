import { assets, generations } from "@/lib/mock-data";
import { nowIso, waitForMock } from "@/services/mock-runtime";
import type { AIGeneration, Asset, CampaignChannel, GenerationMode, ID } from "@/types/domain";

export type GenerationRequest = {
  campaignId: ID;
  mode: GenerationMode;
  prompt: string;
  sourceAssetId?: ID;
  simulateFailure?: boolean;
};

let generationHistory = [...generations];

export async function listGenerations(campaignId: ID) {
  await waitForMock(240);
  return generationHistory.filter((generation) => generation.campaignId === campaignId);
}

export async function deleteGeneration(id: ID) {
  await waitForMock(200);
  generationHistory = generationHistory.filter((g) => g.id !== id);
}

export async function generateAssets(request: GenerationRequest): Promise<AIGeneration> {
  const queued: AIGeneration = {
    id: `generation_${Date.now()}`,
    campaignId: request.campaignId,
    mode: request.mode,
    prompt: request.prompt,
    status: "queued",
    sourceAssetId: request.sourceAssetId,
    outputAssets: [],
    createdAt: nowIso(),
  };

  generationHistory = [queued, ...generationHistory];
  await waitForMock(760);

  if (request.simulateFailure) {
    const failed: AIGeneration = {
      ...queued,
      status: "error",
      errorMessage: "The mock image model rejected this test prompt. Retry will reuse the prompt without the simulated failure flag.",
      completedAt: nowIso(),
    };

    generationHistory = generationHistory.map((generation) => (generation.id === queued.id ? failed : generation));
    throw new Error(failed.errorMessage);
  }

  const channels: CampaignChannel[] = ["LinkedIn", "Instagram", "Email"];
  const outputAssets: Asset[] = [0, 1, 2].map((index) => ({
    id: `asset_${Date.now()}_${index}`,
    campaignId: request.campaignId,
    title: request.mode === "image-to-image" ? `Refined Concept ${index + 1}` : `Generated Direction ${index + 1}`,
    kind: index === 1 ? "carousel" : "image",
    prompt: request.prompt,
    preview: [assets[0].preview, assets[1].preview, assets[2].preview][index],
    channel: channels[index],
    status: "draft",
    createdAt: nowIso(),
  }));

  const completed: AIGeneration = {
    ...queued,
    status: "completed",
    outputAssets,
    completedAt: nowIso(),
  };

  generationHistory = generationHistory.map((generation) => (generation.id === queued.id ? completed : generation));
  return completed;
}
