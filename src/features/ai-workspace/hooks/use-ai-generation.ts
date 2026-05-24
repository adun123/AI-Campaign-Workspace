"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { aiService } from "@/services";
import { queryKeys } from "@/services/query-keys";
import type { AIGeneration, AIGenerationParams, ID } from "@/types";

interface UseAIGenerationOptions {
  campaignId: ID;
}

/**
 * Drives the AI generation lifecycle for the workspace.
 *
 * Surface intentionally small:
 *   - `generate(params)`   — start a new run
 *   - `retry(id)`          — retry a failed run
 *   - `cancel(id)`         — cancel an in-flight run
 *   - `current`            — most recent generation (any status)
 *   - `history`            — all generations for this campaign, newest first
 *
 * Status updates are streamed from the service via the subscriber callback,
 * so the UI can render queued/running/streaming/succeeded/failed states
 * without polling.
 */
export function useAIGeneration({ campaignId }: UseAIGenerationOptions) {
  const queryClient = useQueryClient();
  const [history, setHistory] = React.useState<AIGeneration[]>([]);
  const [currentId, setCurrentId] = React.useState<ID | null>(null);

  // Initial hydrate from service.
  React.useEffect(() => {
    let cancelled = false;
    aiService.list(campaignId).then((items) => {
      if (cancelled) return;
      setHistory(items);
      setCurrentId(items[0]?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  const upsert = React.useCallback((g: AIGeneration) => {
    setHistory((prev) => {
      const idx = prev.findIndex((p) => p.id === g.id);
      if (idx === -1) return [g, ...prev];
      const next = prev.slice();
      next[idx] = g;
      return next;
    });
  }, []);

  const generate = React.useCallback(
    async (params: AIGenerationParams) => {
      const result = await aiService.generate(campaignId, params, (g) => {
        upsert(g);
        setCurrentId(g.id);
      });
      // Surface produced assets in the assets cache.
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      return result;
    },
    [campaignId, upsert, queryClient],
  );

  const retry = React.useCallback(
    async (id: ID) => {
      const result = await aiService.retry(id, (g) => {
        upsert(g);
        setCurrentId(g.id);
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      return result;
    },
    [upsert, queryClient],
  );

  const cancel = React.useCallback(async (id: ID) => {
    await aiService.cancel(id);
    setHistory((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: "cancelled" as const } : g)),
    );
  }, []);

  const current = React.useMemo(
    () => history.find((g) => g.id === currentId) ?? null,
    [history, currentId],
  );

  return { generate, retry, cancel, current, history, setCurrentId };
}
