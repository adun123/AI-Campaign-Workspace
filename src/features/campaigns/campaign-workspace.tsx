"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, ChevronDown, ChevronUp, ImagePlus, Send, Sparkles, Trash2, User, WandSparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkspaceAssetCard } from "@/features/campaigns/workspace-asset-card";
import { WorkspaceHeaderActions } from "@/features/campaigns/workspace-settings-popup";
import { useActiveCampaignQuery, useGenerationsQuery } from "@/hooks/use-workspace-data";
import { generateAssets, deleteGeneration } from "@/services/ai.service";
import { saveAsset } from "@/services/asset.service";
import { scheduleAsset } from "@/services/scheduler.service";
import { useChatStore, aiModels, type ChatMessage } from "@/stores/chat-store";
import { useToastStore } from "@/stores/toast-store";
import { useTrendBriefStore } from "@/stores/trend-brief-store";
import type { Asset, AIGeneration, GenerationMode } from "@/types/domain";

export function CampaignWorkspace() {
  const queryClient = useQueryClient();
  const campaignQuery = useActiveCampaignQuery();
  const campaign = campaignQuery.data;
  const generationsQuery = useGenerationsQuery(campaign?.id);
  const history = useMemo(() => generationsQuery.data ?? [], [generationsQuery.data]);

  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const loadHistory = useChatStore((s) => s.loadHistory);
  const mode = useChatStore((s) => s.mode);
  const setMode = useChatStore((s) => s.setMode);
  const model = useChatStore((s) => s.model);
  const setModel = useChatStore((s) => s.setModel);
  const attachedImages = useChatStore((s) => s.attachedImages);
  const addImages = useChatStore((s) => s.addImages);
  const removeImage = useChatStore((s) => s.removeImage);
  const clearImages = useChatStore((s) => s.clearImages);

  const addToast = useToastStore((s) => s.addToast);
  const pinnedTrend = useTrendBriefStore((s) => s.pinnedTrend);
  const dismissTrend = useTrendBriefStore((s) => s.dismissTrend);

  const [input, setInput] = useState("");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateMutation = useMutation({
    mutationFn: (prompt: string) => {
      if (!campaign) throw new Error("Campaign not loaded");
      return generateAssets({ campaignId: campaign.id, mode, prompt });
    },
    onSuccess: (generation) => {
      addMessage({ role: "ai", content: "Here are the generated assets:", assets: generation.outputAssets });
      addToast("success", "Assets generated");
      void queryClient.invalidateQueries({ queryKey: ["generations", campaign?.id] });
    },
    onError: () => {
      addMessage({ role: "ai", content: "Generation failed. Please try again with a different prompt." });
      addToast("error", "Generation failed");
    },
  });

  const saveMutation = useMutation({
    mutationFn: saveAsset,
    onSuccess: () => {
      addToast("success", "Asset saved");
      void queryClient.invalidateQueries({ queryKey: ["assets", campaign?.id] });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: scheduleAsset,
    onSuccess: () => {
      addToast("success", "Post scheduled");
      void queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGeneration,
    onSuccess: () => {
      addToast("success", "History item deleted");
      void queryClient.invalidateQueries({ queryKey: ["generations", campaign?.id] });
    },
  });

  function handleSend() {
    const prompt = input.trim();
    if (!prompt || generateMutation.isPending) return;
    if (mode === "image-to-image" && attachedImages.length === 0) {
      addToast("error", "Attach an image for image-to-image mode");
      return;
    }
    const imgNames = attachedImages.map((i) => i.file.name);
    addMessage({ role: "user", content: prompt, imageAttachments: imgNames.length > 0 ? imgNames : undefined });
    setInput("");
    clearImages();
    addMessage({ role: "ai", content: "Generating..." });
    generateMutation.mutate(prompt);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleHistoryClick(genId: string) {
    const gen = history.find((g) => g.id === genId);
    if (!gen) return;
    const msgs: ChatMessage[] = [
      { id: `hist_user_${gen.id}`, role: "user", content: gen.prompt, timestamp: gen.createdAt },
      { id: `hist_ai_${gen.id}`, role: "ai", content: gen.status === "completed" ? "Here are the results:" : "Generation was not completed.", assets: gen.outputAssets, timestamp: gen.completedAt ?? gen.createdAt },
    ];
    loadHistory(msgs);
  }

  if (!campaign) {
    return <Card className="p-6 text-sm text-text-muted">Loading campaign workspace...</Card>;
  }

  return (
    <section className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Header: trend brief + settings */}
      <div className="flex shrink-0 items-center justify-between gap-3 pb-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div>
            <Badge tone="primary">Active campaign</Badge>
            <h1 className="mt-1 text-lg font-semibold text-text-primary">{campaign.name}</h1>
          </div>
        </div>
        <WorkspaceHeaderActions campaign={campaign} />
      </div>

      {/* Pinned trend brief */}
      {pinnedTrend && (
        <div className="mb-3 shrink-0 rounded-control border border-accent/30 bg-accent/5 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-accent">Trend Brief</p>
              <p className="mt-1 text-sm font-semibold text-text-primary">{pinnedTrend.title}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {pinnedTrend.hashtags.map((tag) => (
                  <span key={tag} className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">{tag}</span>
                ))}
              </div>
            </div>
            <button type="button" onClick={dismissTrend} className="shrink-0 text-text-muted hover:text-text-primary" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Chat area — internal scroll, takes remaining height */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="space-y-4 pb-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} onSave={(a) => saveMutation.mutate(a)} onSchedule={(a) => scheduleMutation.mutate(a)} busy={saveMutation.isPending || scheduleMutation.isPending} />
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Fixed bottom panel: input + expandable history */}
      <div className="mt-3 w-full shrink-0 space-y-2">
        {/* Input bar */}
        <div className="rounded-card border bg-surface/95 shadow-soft backdrop-blur-xl">
          {/* Attached images preview */}
          {attachedImages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto border-b p-2">
              {attachedImages.map((img) => (
                <div key={img.id} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border">
                  <img src={img.preview} alt={img.file.name} className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removeImage(img.id)} className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black" aria-label="Remove">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-1 p-2">
            {/* Mode toggle icons */}
            <button type="button" onClick={() => setMode("text-to-image")} title="Text to Image" aria-label="Text to Image" className={`flex h-9 w-9 items-center justify-center rounded-control transition ${mode === "text-to-image" ? "bg-primary/15 text-primary-soft" : "text-text-muted hover:bg-surface-elevated hover:text-text-primary"}`}>
              <WandSparkles className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setMode("image-to-image")} title="Image to Image" aria-label="Image to Image" className={`flex h-9 w-9 items-center justify-center rounded-control transition ${mode === "image-to-image" ? "bg-primary/15 text-primary-soft" : "text-text-muted hover:bg-surface-elevated hover:text-text-primary"}`}>
              <ImagePlus className="h-4 w-4" />
            </button>

            {/* Image upload (visible in image-to-image mode) */}
            {mode === "image-to-image" && (
              <>
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" multiple className="hidden" onChange={(e) => { const files = Array.from(e.target.files ?? []); if (files.length) { const total = attachedImages.length + files.length; addImages(files); if (total > 20) addToast("info", `Max 20 images — ${total - 20} file(s) skipped`); } e.target.value = ""; }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} title="Attach images (max 20)" aria-label="Attach images" className="flex h-9 w-9 items-center justify-center rounded-control text-text-muted transition hover:bg-surface-elevated hover:text-text-primary">
                  <ImagePlus className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Separator */}
            <div className="mx-1 h-5 w-px bg-border" />

            {/* Text input */}
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`; }}
              onKeyDown={handleKeyDown}
              placeholder={mode === "image-to-image" ? "Describe how to transform the image..." : "Describe what you want to generate..."}
              className="min-w-0 flex-1 resize-none bg-transparent px-2 text-sm leading-6 text-text-primary outline-none placeholder:text-text-muted/70"
              disabled={generateMutation.isPending}
              rows={1}
              style={{ height: "36px" }}
            />

            {/* Model selector */}
            <div className="relative">
              <button type="button" onClick={() => setShowModelPicker(!showModelPicker)} title={`Model: ${aiModels.find((m) => m.id === model)?.label}`} aria-label="Select AI model" className="flex h-9 w-9 items-center justify-center rounded-control text-text-muted transition hover:bg-surface-elevated hover:text-text-primary">
                <Sparkles className="h-4 w-4" />
              </button>
              {showModelPicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowModelPicker(false)} />
                  <div className="absolute bottom-full right-0 z-50 mb-2 w-44 rounded-card border bg-surface/95 p-1.5 shadow-soft backdrop-blur-xl">
                    {aiModels.map((m) => (
                      <button key={m.id} type="button" onClick={() => { setModel(m.id); setShowModelPicker(false); }} className={`flex w-full items-center rounded-control px-3 py-2 text-xs transition ${model === m.id ? "bg-primary/12 text-text-primary" : "text-text-muted hover:bg-surface-elevated hover:text-text-primary"}`}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Send */}
            <Button size="sm" onClick={handleSend} disabled={!input.trim() || generateMutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expandable history */}
        {history.length > 0 && <ExpandableHistory history={history} onSelect={handleHistoryClick} onDelete={(id) => deleteMutation.mutate(id)} />}
      </div>
    </section>
  );
}

function MessageBubble({ message, onSave, onSchedule, busy }: { message: ChatMessage; onSave: (a: Asset) => void; onSchedule: (a: Asset) => void; busy: boolean }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <Bot className="h-4 w-4 text-primary-soft" />
        </div>
      )}
      <div className={`max-w-[85%] space-y-3 ${isUser ? "items-end" : ""}`}>
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-6 ${isUser ? "bg-primary/14 text-text-primary" : "bg-surface-elevated text-text-muted"}`}>
          {message.content}
        </div>
        {message.assets && message.assets.length > 0 && (
          <div className="flex gap-3 overflow-x-auto">
            {message.assets.map((asset) => (
              <div key={asset.id} className="shrink-0">
                <WorkspaceAssetCard asset={asset} onSave={onSave} onSchedule={onSchedule} busy={busy} />
              </div>
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15">
          <User className="h-4 w-4 text-accent" />
        </div>
      )}
    </div>
  );
}

function ExpandableHistory({ history, onSelect, onDelete }: { history: AIGeneration[]; onSelect: (id: string) => void; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-card border bg-surface/95 shadow-soft backdrop-blur-xl">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium text-text-muted transition hover:text-text-primary">
        <span>History ({history.length} generations)</span>
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-2 border-t p-3 sm:grid-cols-3 lg:grid-cols-4">
          {history.map((gen) => (
            <div key={gen.id} className="group relative rounded-control border bg-surface-muted p-2.5 transition hover:bg-surface-elevated">
              <button type="button" onClick={() => { onSelect(gen.id); setOpen(false); }} className="w-full text-left">
                <div className={`mb-2 h-12 w-full rounded-control ${gen.outputAssets[0]?.preview ?? "bg-surface-elevated"}`} />
                <p className="line-clamp-2 text-xs font-medium leading-4 text-text-primary">{gen.prompt}</p>
                <p className="mt-1 text-xs text-text-muted">{gen.outputAssets.length} assets</p>
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(gen.id); }} aria-label="Delete" className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition hover:bg-error group-hover:opacity-100">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
