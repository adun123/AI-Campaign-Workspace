import type { Campaign, ID } from "@/types/domain";

export async function listCampaigns(): Promise<Campaign[]> {
  const res = await fetch("/api/campaigns");
  if (!res.ok) throw new Error("Gagal mengambil campaigns.");
  return res.json();
}

export async function createCampaign(data: Omit<Campaign, "id" | "createdAt">): Promise<Campaign> {
  const res = await fetch("/api/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal membuat campaign.");
  return res.json();
}

export async function updateCampaign(id: ID, data: Partial<Campaign>): Promise<Campaign> {
  const res = await fetch(`/api/campaigns/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengupdate campaign.");
  return res.json();
}

export async function deleteCampaign(id: ID): Promise<void> {
  const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus campaign.");
}

export async function getActiveCampaign(): Promise<Campaign | null> {
  const campaigns = await listCampaigns();
  return campaigns[0] ?? null;
}

export async function getCampaignById(id: ID): Promise<Campaign> {
  const res = await fetch(`/api/campaigns/${id}`);
  if (!res.ok) throw new Error("Gagal mengambil campaign.");
  return res.json();
}
