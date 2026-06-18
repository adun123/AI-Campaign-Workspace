"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, ChevronDown, ChevronUp, ImagePlus, Plus, Send, Sparkles, Trash2, User, WandSparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { WorkspaceAssetCard } from "@/features/campaigns/workspace-asset-card";
import { WorkspaceHeaderActions } from "@/features/campaigns/workspace-settings-popup";
import { useActiveCampaignQuery, useCampaignByIdQuery, useGenerationsQuery } from "@/hooks/use-workspace-data";
import { generateAssets, deleteGeneration } from "@/services/ai.service";
import { saveAsset } from "@/services/asset.service";
import { scheduleAsset } from "@/services/scheduler.service";
import { createCampaign } from "@/services/campaign.service";
import { useChatStore, aiModels, type ChatMessage } from "@/stores/chat-store";
import { useToastStore } from "@/stores/toast-store";
import { useTrendBriefStore } from "@/stores/trend-brief-store";
import type { Asset, AIGeneration, CampaignChannel, GenerationMode } from "@/types/domain";

function fileToDataURI(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CampaignWorkspace({ campaignId }: { campaignId?: string } = {}) {
  const queryClient = useQueryClient();
  const campaignByIdQuery = useCampaignByIdQuery(campaignId);
  const activeCampaignQuery = useActiveCampaignQuery();
  const campaignQuery = campaignId ? campaignByIdQuery : activeCampaignQuery;
  const campaign = campaignQuery.data;
  const generationsQuery = useGenerationsQuery(campaign?.id);
  const history = useMemo(() => generationsQuery.data ?? [], [generationsQuery.data]);

  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const loadHistory = useChatStore((s) => s.loadHistory);
  const setCampaign = useChatStore((s) => s.setCampaign);
  const mode = useChatStore((s) => s.mode);
  const setMode = useChatStore((s) => s.setMode);
  const model = useChatStore((s) => s.model);
  const setModel = useChatStore((s) => s.setModel);
  const attachedImages = useChatStore((s) => s.attachedImages);
  const addImages = useChatStore((s) => s.addImages);
  const removeImage = useChatStore((s) => s.removeImage);
  const clearImages = useChatStore((s) => s.clearImages);
  const aspectRatio = useChatStore((s) => s.aspectRatio);

  const addToast = useToastStore((s) => s.addToast);
  const pinnedTrend = useTrendBriefStore((s) => s.pinnedTrend);
  const dismissTrend = useTrendBriefStore((s) => s.dismissTrend);

  const [input, setInput] = useState("");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set active campaign in chat store when campaign changes
  useEffect(() => {
    if (campaign?.id) {
      setCampaign(campaign.id);
    }
  }, [campaign?.id, setCampaign]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateMutation = useMutation({
    mutationFn: async (prompt: string) => {
      if (!campaign) throw new Error("Campaign not loaded");
      let images: string[] | undefined;
      if (mode === "image-to-image" && attachedImages.length > 0) {
        images = await Promise.all(attachedImages.map((img) => fileToDataURI(img.file)));
      }
      return generateAssets({ campaignId: campaign.id, mode, prompt, images, aspectRatio });
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
    mutationFn: (asset: Asset) => saveAsset({ campaignId: asset.campaignId, title: asset.title, kind: asset.kind, prompt: asset.prompt, preview: asset.preview, channel: asset.channel, status: "saved" }),
    onSuccess: () => {
      addToast("success", "Asset saved to library");
      void queryClient.invalidateQueries({ queryKey: ["assets", campaign?.id] });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: (asset: Asset) => scheduleAsset({ campaignId: asset.campaignId, assetId: asset.id, channel: asset.channel, date: new Date().toISOString().split("T")[0], time: "09:00" }),
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
    addMessage({ role: "user", content: `📂 ${gen.prompt}` });
    addMessage({ role: "ai", content: gen.status === "completed" ? "Here are the results from history:" : "This generation was not completed.", assets: gen.outputAssets });
  }

  function handleEditComplete(instruction: string, newAsset: Asset) {
    addMessage({ role: "user", content: `✏️ Edit: ${instruction}` });
    addMessage({ role: "ai", content: "Here's the edited image:", assets: [newAsset] });
    void queryClient.invalidateQueries({ queryKey: ["generations", campaign?.id] });
  }

  if (campaignQuery.isLoading) {
    return <Card className="p-6 text-sm text-text-muted">Loading campaign workspace...</Card>;
  }

  if (!campaign) {
    return <CreateCampaignCard />;
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
            <MessageBubble key={msg.id} message={msg} onSave={(a) => saveMutation.mutate(a)} onSchedule={(a) => scheduleMutation.mutate(a)} onEditComplete={handleEditComplete} busy={saveMutation.isPending || scheduleMutation.isPending} />
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

            {/* Aspect ratio selector */}
            <AspectRatioSelector />

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

function MessageBubble({ message, onSave, onSchedule, onEditComplete, busy }: { message: ChatMessage; onSave: (a: Asset) => void; onSchedule: (a: Asset) => void; onEditComplete?: (instruction: string, newAsset: Asset) => void; busy: boolean }) {
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
                <WorkspaceAssetCard asset={asset} onSave={onSave} onSchedule={onSchedule} onEditComplete={onEditComplete} busy={busy} />
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
          {history.map((gen) => {
            const outputAssets = gen.outputAssets ?? [];
            const firstPreview = outputAssets[0]?.preview;
            const isImageUrl = firstPreview?.startsWith("http") || firstPreview?.startsWith("data:");

            return (
              <div key={gen.id} className="group relative rounded-control border bg-surface-muted p-2.5 transition hover:bg-surface-elevated">
                <button type="button" onClick={() => { onSelect(gen.id); setOpen(false); }} className="w-full text-left">
                  {isImageUrl ? (
                    <div className="mb-2 h-12 w-full overflow-hidden rounded-control">
                      <img src={firstPreview} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="mb-2 h-12 w-full rounded-control bg-surface-elevated" />
                  )}
                  <p className="line-clamp-2 text-xs font-medium leading-4 text-text-primary">{gen.prompt}</p>
                  <p className="mt-1 text-xs text-text-muted">{outputAssets.length} assets</p>
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(gen.id); }} aria-label="Delete" className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition hover:bg-error group-hover:opacity-100">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1", desc: "Feed Square" },
  { id: "4:5", label: "4:5", desc: "Feed Portrait" },
  { id: "9:16", label: "9:16", desc: "Story/Reels" },
  { id: "16:9", label: "16:9", desc: "Landscape" },
];

function AspectRatioSelector() {
  const [open, setOpen] = useState(false);
  const aspectRatio = useChatStore((s) => s.aspectRatio);
  const setAspectRatio = useChatStore((s) => s.setAspectRatio);
  const current = ASPECT_RATIOS.find((a) => a.id === aspectRatio) ?? ASPECT_RATIOS[0];

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} title={`Size: ${current.desc}`} className="flex h-9 items-center gap-1 rounded-control px-2 text-xs font-medium text-text-muted transition hover:bg-surface-elevated hover:text-text-primary">
        <span className="inline-block h-4 w-3 rounded-sm border border-current" style={{ aspectRatio: current.id.replace(":", "/") }} />
        <span>{current.label}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-50 mb-2 w-36 rounded-card border bg-surface/95 p-1.5 shadow-soft backdrop-blur-xl">
            {ASPECT_RATIOS.map((ar) => (
              <button key={ar.id} type="button" onClick={() => { setAspectRatio(ar.id); setOpen(false); }} className={`flex w-full items-center gap-2 rounded-control px-3 py-2 text-xs transition ${aspectRatio === ar.id ? "bg-primary/12 text-text-primary" : "text-text-muted hover:bg-surface-elevated hover:text-text-primary"}`}>
                <span className="inline-block h-4 w-3 rounded-sm border border-current" style={{ aspectRatio: ar.id.replace(":", "/") }} />
                <span>{ar.desc}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CreateCampaignCard() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("");
  const [channels, setChannels] = useState<CampaignChannel[]>([]);
  const [launchDate, setLaunchDate] = useState("");

  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      addToast("success", "Campaign created!");
      void queryClient.invalidateQueries({ queryKey: ["active-campaign"] });
    },
    onError: () => {
      addToast("error", "Failed to create campaign");
    },
  });

  const allChannels: CampaignChannel[] = ["Instagram", "LinkedIn", "TikTok", "Email"];

  function toggleChannel(ch: CampaignChannel) {
    setChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      addToast("error", "Campaign name is required");
      return;
    }
    createMutation.mutate({
      name: name.trim(),
      objective,
      audience,
      tone,
      channels,
      launchDate,
      status: "draft",
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
      <Card className="w-full max-w-lg p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
            <Plus className="h-6 w-6 text-primary-soft" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary">Create Your First Campaign</h2>
          <p className="mt-1 text-sm text-text-muted">Set up a campaign to start generating AI content</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-text-muted">Campaign Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Summer Sale 2026"
              className="h-9 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-text-muted">Objective</label>
            <input
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Drive brand awareness and sales"
              className="h-9 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-text-muted">Target Audience</label>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Gen-Z creators"
                className="h-9 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-text-muted">Tone</label>
              <input
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="Bold, energetic"
                className="h-9 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-text-muted">Channels</label>
            <div className="flex flex-wrap gap-2">
              {allChannels.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    channels.includes(ch)
                      ? "bg-primary/15 text-primary-soft"
                      : "bg-surface-muted text-text-muted hover:bg-surface-elevated"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-text-muted">Launch Date</label>
            <DatePicker value={launchDate} onChange={setLaunchDate} placeholder="Select launch date" />
          </div>

          <Button type="submit" className="w-full" size="sm" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Campaign"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
