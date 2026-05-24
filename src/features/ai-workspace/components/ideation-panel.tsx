"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, RotateCcw, Square, Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { AIGeneration, AIGenerationParams, AIModel, AssetType } from "@/types";
import { GenerationStatusPill } from "./generation-status-pill";
import { GeneratedAssetGrid } from "./generated-asset-grid";

interface IdeationPanelProps {
  current: AIGeneration | null;
  outputType: AssetType;
  model: AIModel;
  onGenerate: (params: AIGenerationParams) => void;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
}

const PROMPT_SUGGESTIONS = [
  "Hero shot of the product on matte stone, studio lighting.",
  "Three Instagram captions, confident tone, lead with comfort.",
  "30-second TikTok script — hook in 3s, payoff at 25s.",
];

export function IdeationPanel({
  current,
  outputType,
  model,
  onGenerate,
  onRetry,
  onCancel,
}: IdeationPanelProps) {
  const [prompt, setPrompt] = React.useState("");
  const isBusy =
    current != null &&
    (current.status === "queued" ||
      current.status === "running" ||
      current.status === "streaming");

  const submit = () => {
    const trimmed = prompt.trim();
    if (!trimmed || isBusy) return;
    onGenerate({ prompt: trimmed, outputType, model, options: { variations: 2 } });
    setPrompt("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <section className="flex h-full min-h-0 flex-col">
      {/* Stage: outputs */}
      <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin">
        <div className="mx-auto w-full max-w-3xl space-y-8">
          <AnimatePresence mode="popLayout">
            {current ? (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      Last prompt
                    </p>
                    <p className="mt-1 text-sm text-foreground">{current.params.prompt}</p>
                  </div>
                  <GenerationStatusPill generation={current} />
                </div>

                <GeneratedAssetGrid generation={current} />

                {current.status === "failed" ? (
                  <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
                    <span className="text-destructive">
                      {current.error?.message ?? "Generation failed."}
                    </span>
                    <Button variant="secondary" size="sm" onClick={() => onRetry(current.id)}>
                      <RotateCcw className="h-3.5 w-3.5" />
                      Retry
                    </Button>
                  </div>
                ) : null}
              </motion.div>
            ) : (
              <EmptyStage onPick={(p) => setPrompt(p)} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-surface/40 px-8 py-4">
        <div className="mx-auto w-full max-w-3xl">
          <div
            className={cn(
              "rounded-xl border border-border bg-surface p-2 transition-colors",
              "focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20",
            )}
          >
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Describe what to generate. ${outputType === "image" ? "Describe the scene, style, and mood." : "Describe the message, tone, and audience."}`}
              className="min-h-[64px] resize-none border-0 bg-transparent px-2 py-2 focus-visible:ring-0"
              aria-label="AI prompt"
            />
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Badge variant="secondary" className="gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  {model}
                </Badge>
                <span className="hidden sm:inline">
                  ⌘ + Enter to generate
                </span>
              </div>

              {isBusy && current ? (
                <Button variant="secondary" size="sm" onClick={() => onCancel(current.id)}>
                  <Square className="h-3.5 w-3.5" />
                  Stop
                </Button>
              ) : (
                <Button size="sm" onClick={submit} disabled={!prompt.trim()}>
                  <ArrowUp className="h-4 w-4" />
                  Generate
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmptyStage({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 px-8 py-16 text-center">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-full bg-primary/15 text-primary">
        <Sparkles className="h-5 w-5" />
      </div>
      <h2 className="text-lg font-medium">Start ideating</h2>
      <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
        Describe the asset you want to create. The workspace will produce variations you can iterate
        on, save, or schedule.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {PROMPT_SUGGESTIONS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPick(p)}
            className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
