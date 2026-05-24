/**
 * In-memory mock database. Module-singleton, cloned on read so callers
 * cannot mutate it accidentally. Replace the whole `services/` layer
 * with HTTP clients when the backend lands — types stay the same.
 */
import type {
  AIGeneration,
  Asset,
  BrandKit,
  Campaign,
  ScheduledPost,
  User,
  Workspace,
} from "@/types";
import {
  seedAssets,
  seedBrandKits,
  seedCampaigns,
  seedGenerations,
  seedScheduled,
  seedUser,
  seedWorkspace,
} from "./seed";

interface MockDB {
  user: User;
  workspace: Workspace;
  brandKits: BrandKit[];
  campaigns: Campaign[];
  assets: Asset[];
  generations: AIGeneration[];
  scheduled: ScheduledPost[];
}

const db: MockDB = {
  user: seedUser,
  workspace: seedWorkspace,
  brandKits: [...seedBrandKits],
  campaigns: [...seedCampaigns],
  assets: [...seedAssets],
  generations: [...seedGenerations],
  scheduled: [...seedScheduled],
};

export function getDB(): MockDB {
  return db;
}

export function clone<T>(value: T): T {
  // structuredClone is available in modern Node + browsers
  return structuredClone(value);
}
