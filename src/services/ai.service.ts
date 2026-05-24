import type { AIGeneration, AIGenerationParams, AIGenerationStatus, Asset, ID } from "@/types";
import { createId } from "@/lib/id";
import { delay, jitter } from "@/lib/delay";
import { clone, getDB } from "./mock/db";

/**
 * AI service abstraction.
 *
 * The mock implementation simulates the full lifecycle (queued → running →
 * streaming → succeeded / failed) by emitting status updates to a subscriber.
 * The real implementation can stream over WebSocket / SSE without changing
 * the surface.
 */
export interface AIServiceSubscriber {
  (generation: AIGeneration): void;
}

export interface AIService {
  generate(
    campaignId: ID,
    params: AIGenerationParams,
    onUpdate?: AIServiceSubscriber,
  ): Promise<AIGeneration>;
  cancel(generationId: ID): Promise<void>;
  retry(generationId: ID, onUpdate?: AIServiceSubscriber): Promise<AIGeneration>;
  list(campaignId: ID): Promise<AIGeneration[]>;
}

const SAMPLE_CAPTIONS = [
  "Comfort that disappears. Sound that doesn't.",
  "Made for the way you actually listen.",
  "All-day fit. Studio-grade sound.",
];

function buildAssetsFor(generation: AIGeneration): Asset[] {
  const now = new Date().toISOString();
  const variations = generation.params.options?.variations ?? 1;
  const type = generation.params.outputType;

  return Array.from({ length: variations }).map((_, i) => {
    const id = createId("asset");
    const base = {
      id,
      campaignId: generation.campaignId,
      workspaceId: getDB().workspace.id,
      type,
      tags: ["ai-generated", type],
      saved: false,
      generationId: generation.id,
      createdAt: now,
      updatedAt: now,
    };

    if (type === "image" || type === "video") {
      const seed = encodeURIComponent(`${generation.id}-${i}`);
      return {
        ...base,
        title: `${generation.params.prompt.slice(0, 40)} — v${i + 1}`,
        url: `https://picsum.photos/seed/${seed}/800/800`,
        thumbnailUrl: `https://picsum.photos/seed/${seed}/400/400`,
        dimensions: { width: 1080, height: 1080 },
      } satisfies Asset;
    }

    return {
      ...base,
      title: `${generation.params.prompt.slice(0, 40)} — v${i + 1}`,
      content: SAMPLE_CAPTIONS[i % SAMPLE_CAPTIONS.length] ?? SAMPLE_CAPTIONS[0]!,
    } satisfies Asset;
  });
}

function update(generation: AIGeneration, patch: Partial<AIGeneration>): AIGeneration {
  const db = getDB();
  const idx = db.generations.findIndex((g) => g.id === generation.id);
  const next: AIGeneration = {
    ...generation,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  if (idx === -1) db.generations.unshift(next);
  else db.generations[idx] = next;
  return next;
}

async function run(
  generation: AIGeneration,
  onUpdate?: AIServiceSubscriber,
): Promise<AIGeneration> {
  const transitions: AIGenerationStatus[] = ["queued", "running", "streaming"];
  let current = generation;

  for (const status of transitions) {
    await delay(jitter(350, 800));
    current = update(current, {
      status,
      progress: status === "queued" ? 0.1 : status === "running" ? 0.45 : 0.8,
    });
    onUpdate?.(clone(current));
  }

  // Simulate occasional failure for retry UX (~10%)
  if (Math.random() < 0.1) {
    await delay(jitter(200, 400));
    current = update(current, {
      status: "failed",
      error: { code: "rate_limited", message: "The model is busy. Try again." },
    });
    onUpdate?.(clone(current));
    return clone(current);
  }

  await delay(jitter(400, 900));
  const assets = buildAssetsFor(current);
  getDB().assets.unshift(...assets);
  current = update(current, {
    status: "succeeded",
    progress: 1,
    resultAssetIds: assets.map((a) => a.id),
  });
  onUpdate?.(clone(current));
  return clone(current);
}

export const aiService: AIService = {
  async generate(campaignId, params, onUpdate) {
    const now = new Date().toISOString();
    const initial: AIGeneration = {
      id: createId("gen"),
      campaignId,
      status: "queued",
      params,
      resultAssetIds: [],
      progress: 0,
      createdAt: now,
      updatedAt: now,
    };
    getDB().generations.unshift(initial);
    onUpdate?.(clone(initial));
    return run(initial, onUpdate);
  },

  async cancel(generationId) {
    await delay(jitter(100, 250));
    const db = getDB();
    const idx = db.generations.findIndex((g) => g.id === generationId);
    if (idx === -1) return;
    const existing = db.generations[idx];
    if (!existing) return;
    db.generations[idx] = {
      ...existing,
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    };
  },

  async retry(generationId, onUpdate) {
    const db = getDB();
    const existing = db.generations.find((g) => g.id === generationId);
    if (!existing) throw new Error(`Generation ${generationId} not found`);
    const reset = update(existing, {
      status: "queued",
      error: undefined,
      progress: 0,
      resultAssetIds: [],
    });
    onUpdate?.(clone(reset));
    return run(reset, onUpdate);
  },

  async list(campaignId) {
    await delay(jitter(150, 350));
    return clone(getDB().generations.filter((g) => g.campaignId === campaignId));
  },
};
