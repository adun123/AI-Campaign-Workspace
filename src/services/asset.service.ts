import { assets } from "@/lib/mock-data";
import { nowIso, waitForMock } from "@/services/mock-runtime";
import type { Asset, ID } from "@/types/domain";

let savedAssets = [...assets];

export async function listAssets(campaignId?: ID) {
  await waitForMock(260);
  return campaignId ? savedAssets.filter((asset) => asset.campaignId === campaignId) : savedAssets;
}

export async function saveAsset(asset: Asset) {
  await waitForMock(300);
  const savedAsset: Asset = { ...asset, status: "saved", createdAt: nowIso() };
  savedAssets = [savedAsset, ...savedAssets.filter((item) => item.id !== asset.id)];
  return savedAsset;
}

export async function deleteAsset(id: ID) {
  await waitForMock(200);
  savedAssets = savedAssets.filter((item) => item.id !== id);
}
