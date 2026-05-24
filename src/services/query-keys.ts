/**
 * Centralized TanStack Query key factories. Keeps cache invalidation safe
 * and avoids stringly-typed keys leaking across features.
 */
import type { ID } from "@/types";
import type { AssetsListFilter } from "./assets.service";
import type { SchedulerListFilter } from "./scheduler.service";

export const queryKeys = {
  me: ["me"] as const,
  workspace: ["workspace"] as const,

  campaigns: {
    all: ["campaigns"] as const,
    list: () => ["campaigns", "list"] as const,
    detail: (id: ID) => ["campaigns", "detail", id] as const,
  },

  assets: {
    all: ["assets"] as const,
    list: (filter?: AssetsListFilter) => ["assets", "list", filter ?? {}] as const,
    detail: (id: ID) => ["assets", "detail", id] as const,
  },

  generations: {
    all: ["generations"] as const,
    list: (campaignId: ID) => ["generations", "list", campaignId] as const,
  },

  scheduled: {
    all: ["scheduled"] as const,
    list: (filter?: SchedulerListFilter) => ["scheduled", "list", filter ?? {}] as const,
  },

  brandKits: {
    all: ["brand-kits"] as const,
    list: () => ["brand-kits", "list"] as const,
    detail: (id: ID) => ["brand-kits", "detail", id] as const,
  },
} as const;
