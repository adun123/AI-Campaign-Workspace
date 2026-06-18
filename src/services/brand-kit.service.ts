import type { BrandKit, ID } from "@/types/domain";

export async function listBrandKits(): Promise<BrandKit[]> {
  const res = await fetch("/api/brand-kit");
  if (!res.ok) throw new Error("Gagal mengambil brand kits.");
  return res.json();
}

export async function getActiveBrandKit(): Promise<BrandKit | null> {
  const kits = await listBrandKits();
  return kits[0] ?? null;
}

export async function createBrandKit(data: Omit<BrandKit, "id">): Promise<BrandKit> {
  const res = await fetch("/api/brand-kit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal membuat brand kit.");
  return res.json();
}

export async function updateBrandKit(id: ID, data: Partial<BrandKit>): Promise<BrandKit> {
  const res = await fetch(`/api/brand-kit/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Gagal mengupdate brand kit.");
  return res.json();
}
