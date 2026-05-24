import type { Campaign, ID } from "@/types";
import { delay, jitter } from "@/lib/delay";
import { createId } from "@/lib/id";
import { clone, getDB } from "./mock/db";

export interface CampaignsService {
  list(): Promise<Campaign[]>;
  get(id: ID): Promise<Campaign | null>;
  create(input: Omit<Campaign, "id" | "createdAt" | "updatedAt">): Promise<Campaign>;
  update(id: ID, patch: Partial<Campaign>): Promise<Campaign>;
  remove(id: ID): Promise<void>;
}

export const campaignsService: CampaignsService = {
  async list() {
    await delay(jitter(200, 500));
    return clone(getDB().campaigns);
  },

  async get(id) {
    await delay(jitter(150, 350));
    return clone(getDB().campaigns.find((c) => c.id === id) ?? null);
  },

  async create(input) {
    await delay(jitter(300, 600));
    const now = new Date().toISOString();
    const campaign: Campaign = {
      ...input,
      id: createId("camp"),
      createdAt: now,
      updatedAt: now,
    };
    getDB().campaigns.unshift(campaign);
    return clone(campaign);
  },

  async update(id, patch) {
    await delay(jitter(200, 400));
    const db = getDB();
    const idx = db.campaigns.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Campaign ${id} not found`);
    const existing = db.campaigns[idx];
    if (!existing) throw new Error(`Campaign ${id} not found`);
    const next: Campaign = {
      ...existing,
      ...patch,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    db.campaigns[idx] = next;
    return clone(next);
  },

  async remove(id) {
    await delay(jitter(150, 300));
    const db = getDB();
    db.campaigns = db.campaigns.filter((c) => c.id !== id);
  },
};
