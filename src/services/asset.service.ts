import type { Asset, ID } from "@/types/domain";

export type UploadResult = {
  success: boolean;
  url: string;
  path: string;
  name: string;
};

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
    body: JSON.stringify({
      campaign_id: asset.campaignId,
      title: asset.title,
      kind: asset.kind,
      prompt: asset.prompt,
      preview: asset.preview,
      channel: asset.channel,
      status: "saved",
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? "Gagal menyimpan asset.");
  }
  return res.json();
}

export async function deleteAsset(id: ID): Promise<void> {
  const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus asset.");
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(json.error ?? "Gagal mengupload file.");
  }
  return res.json();
}
