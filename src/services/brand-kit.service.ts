import type { BrandKit, ID } from "@/types/domain";

// Transform snake_case (DB) to camelCase (frontend)
function toCamelCase(row: Record<string, unknown>): BrandKit {
  return {
    id: row.id as string,
    workspaceId: row.workspace_id as string,
    name: row.name as string,
    voice: (row.voice as string) ?? "",
    colors: (row.colors as string[]) ?? [],
    logoUrl: (row.logo_url as string) ?? "",
    guardrails: (row.guardrails as string[]) ?? [],
    logoEnabled: (row.logo_enabled as boolean) ?? false,
    logoPosition: (row.logo_position as BrandKit["logoPosition"]) ?? "bottom-right",
    logoSizePercent: (row.logo_size_percent as number) ?? 15,
    voiceEnabled: (row.voice_enabled as boolean) ?? true,
    colorsEnabled: (row.colors_enabled as boolean) ?? true,
    guardrailsEnabled: (row.guardrails_enabled as boolean) ?? true,
    typography: (row.typography as string) ?? "",
    typographyEnabled: (row.typography_enabled as boolean) ?? false,
    brandValues: (row.brand_values as string[]) ?? [],
    brandValuesEnabled: (row.brand_values_enabled as boolean) ?? false,
  };
}

// Transform camelCase (frontend) to snake_case (DB)
function toSnakeCase(data: Partial<BrandKit>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (data.name !== undefined) result.name = data.name;
  if (data.voice !== undefined) result.voice = data.voice;
  if (data.colors !== undefined) result.colors = data.colors;
  if (data.logoUrl !== undefined) result.logo_url = data.logoUrl;
  if (data.guardrails !== undefined) result.guardrails = data.guardrails;
  if (data.logoEnabled !== undefined) result.logo_enabled = data.logoEnabled;
  if (data.logoPosition !== undefined) result.logo_position = data.logoPosition;
  if (data.logoSizePercent !== undefined) result.logo_size_percent = data.logoSizePercent;
  if (data.voiceEnabled !== undefined) result.voice_enabled = data.voiceEnabled;
  if (data.colorsEnabled !== undefined) result.colors_enabled = data.colorsEnabled;
  if (data.guardrailsEnabled !== undefined) result.guardrails_enabled = data.guardrailsEnabled;
  if (data.typography !== undefined) result.typography = data.typography;
  if (data.typographyEnabled !== undefined) result.typography_enabled = data.typographyEnabled;
  if (data.brandValues !== undefined) result.brand_values = data.brandValues;
  if (data.brandValuesEnabled !== undefined) result.brand_values_enabled = data.brandValuesEnabled;
  return result;
}

export async function listBrandKits(): Promise<BrandKit[]> {
  const res = await fetch("/api/brand-kit");
  if (!res.ok) throw new Error("Gagal mengambil brand kits.");
  const rows = await res.json();
  return Array.isArray(rows) ? rows.map(toCamelCase) : [];
}

export async function getActiveBrandKit(): Promise<BrandKit | null> {
  const kits = await listBrandKits();
  return kits[0] ?? null;
}

export async function createBrandKit(data: Omit<BrandKit, "id">): Promise<BrandKit> {
  const res = await fetch("/api/brand-kit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toSnakeCase(data)),
  });
  if (!res.ok) throw new Error("Gagal membuat brand kit.");
  return toCamelCase(await res.json());
}

export async function updateBrandKit(id: ID, data: Partial<BrandKit>): Promise<BrandKit> {
  const res = await fetch(`/api/brand-kit/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toSnakeCase(data)),
  });
  if (!res.ok) throw new Error("Gagal mengupdate brand kit.");
  return toCamelCase(await res.json());
}

export async function deleteBrandKit(id: ID): Promise<void> {
  const res = await fetch(`/api/brand-kit/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus brand kit.");
}
