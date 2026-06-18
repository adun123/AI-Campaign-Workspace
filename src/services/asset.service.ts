import type { Asset, ID } from "@/types/domain";

export async function listAssets(campaignId?: ID): Promise<Asset[]> {
  const url = campaignId ? `/api/assets?campaign_id=${campaignId}` : "/api/assets";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mengambil assets.");
  return res.json();
}

export async function saveAsset(asset: Omit<Asset, "id" | "createdAt">): Promise<Asset> {
  const res = await fetch("/api/assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...asset, status: "saved" }),
  });
  if (!res.ok) throw new Error("Gagal menyimpan asset.");
  return res.json();
}

export async function deleteAsset(id: ID): Promise<void> {
  const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus asset.");
}
