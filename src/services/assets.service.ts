import type { Asset, ID } from "@/types";
import { delay, jitter } from "@/lib/delay";
import { createId } from "@/lib/id";
import { clone, getDB } from "./mock/db";

export interface AssetsListFilter {
  campaignId?: ID;
  type?: Asset["type"];
  saved?: boolean;
  search?: string;
}

export interface AssetsService {
  list(filter?: AssetsListFilter): Promise<Asset[]>;
  get(id: ID): Promise<Asset | null>;
  create(input: Omit<Asset, "id" | "createdAt" | "updatedAt">): Promise<Asset>;
  update(id: ID, patch: Partial<Asset>): Promise<Asset>;
  remove(id: ID): Promise<void>;
}

export const assetsService: AssetsService = {
  async list(filter) {
    await delay(jitter(150, 350));
    let items = getDB().assets;
    if (filter?.campaignId) items = items.filter((a) => a.campaignId === filter.campaignId);
    if (filter?.type) items = items.filter((a) => a.type === filter.type);
    if (typeof filter?.saved === "boolean") items = items.filter((a) => a.saved === filter.saved);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return clone(items);
  },

  async get(id) {
    await delay(jitter(100, 250));
    return clone(getDB().assets.find((a) => a.id === id) ?? null);
  },

  async create(input) {
    await delay(jitter(200, 450));
    const now = new Date().toISOString();
    const asset: Asset = {
      ...input,
      id: createId("asset"),
      createdAt: now,
      updatedAt: now,
    };
    getDB().assets.unshift(asset);
    return clone(asset);
  },

  async update(id, patch) {
    await delay(jitter(150, 300));
    const db = getDB();
    const idx = db.assets.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`Asset ${id} not found`);
    const existing = db.assets[idx];
    if (!existing) throw new Error(`Asset ${id} not found`);
    const next: Asset = {
      ...existing,
      ...patch,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    db.assets[idx] = next;
    return clone(next);
  },

  async remove(id) {
    await delay(jitter(100, 250));
    const db = getDB();
    db.assets = db.assets.filter((a) => a.id !== id);
  },
};
