import type { BrandKit, ID } from "@/types";
import { delay, jitter } from "@/lib/delay";
import { clone, getDB } from "./mock/db";

export interface BrandKitService {
  list(): Promise<BrandKit[]>;
  get(id: ID): Promise<BrandKit | null>;
  update(id: ID, patch: Partial<BrandKit>): Promise<BrandKit>;
}

export const brandKitService: BrandKitService = {
  async list() {
    await delay(jitter(150, 300));
    return clone(getDB().brandKits);
  },

  async get(id) {
    await delay(jitter(100, 250));
    return clone(getDB().brandKits.find((b) => b.id === id) ?? null);
  },

  async update(id, patch) {
    await delay(jitter(150, 300));
    const db = getDB();
    const idx = db.brandKits.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error(`Brand kit ${id} not found`);
    const existing = db.brandKits[idx];
    if (!existing) throw new Error(`Brand kit ${id} not found`);
    const next: BrandKit = {
      ...existing,
      ...patch,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    db.brandKits[idx] = next;
    return clone(next);
  },
};
