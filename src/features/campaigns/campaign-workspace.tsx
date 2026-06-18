"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, Check, ChevronDown, ChevronUp, Copy, Cpu, DollarSign, FileText, Image, ImagePlus, Plus, RefreshCw, Send, Sparkles, Trash2, Type, User, WandSparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { WorkspaceAssetCard } from "@/features/campaigns/workspace-asset-card";
import { WorkspaceHeaderActions } from "@/features/campaigns/workspace-settings-popup";
import { useActiveCampaignQuery, useActiveBrandKitQuery, useCampaignByIdQuery, useGenerationsQuery } from "@/hooks/use-workspace-data";
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

const PROMPT_SUGGESTIONS = [
  { label: "Product Photo", prompt: "Professional product photography with clean background, studio lighting" },
  { label: "Social Banner", prompt: "Eye-catching social media banner with bold colors and modern design" },
  { label: "Logo Variation", prompt: "Creative logo concept with minimalist style and memorable design" },
  { label: "Brand Illustration", prompt: "Custom brand illustration for marketing materials" },
  { label: "Campaign Visual", prompt: "Campaign hero image for social media and web" },
  { label: "Promotional Poster", prompt: "Promotional poster design with clear call-to-action" },
];

function calculateCost(generationMode: GenerationMode, aspectRatio: string, numImages: number = 1): number {
  if (generationMode === "text-to-image") {
    const aspectMultiplier = aspectRatio === "16:9" || aspectRatio === "9:16" ? 1.2 : 1.0;
    return 0.003 * aspectMultiplier;
  }
  // Image-to-image: Flux Kontext Pro $0.04/image, multi charges per input image
  const aspectMultiplier = aspectRatio === "16:9" || aspectRatio === "9:16" ? 1.2 : 1.0;
  return 0.04 * numImages * aspectMultiplier;
}

export function CampaignWorkspace({ campaignId }: { campaignId?: string } = {}) {
  const queryClient = useQueryClient();
  const campaignByIdQuery = useCampaignByIdQuery(campaignId);
  const activeCampaignQuery = useActiveCampaignQuery();
  const campaignQuery = campaignId ? campaignByIdQuery : activeCampaignQuery;
  const campaign = campaignQuery.data;
  const generationsQuery = useGenerationsQuery(campaign?.id);
  const history = useMemo(() => generationsQuery.data ?? [], [generationsQuery.data]);

  // Brand kit query - get active brand kit for this workspace
  const brandKitQuery = useActiveBrandKitQuery(campaign?.workspaceId);
  const brandKit = brandKitQuery.data;

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
  const generatePromptFromTrend = useTrendBriefStore((s) => s.generatePromptFromTrend);

  const [input, setInput] = useState("");
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showCampaignInfo, setShowCampaignInfo] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);
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
    mutationFn: async ({ prompt, imageFiles }: { prompt: string; imageFiles: File[] }) => {
      if (!campaign) throw new Error("Campaign not loaded");
      let images: string[] | undefined;
      if (mode === "image-to-image" && imageFiles.length > 0) {
        images = await Promise.all(imageFiles.map((file) => fileToDataURI(file)));
      }
      return generateAssets({ campaignId: campaign.id, mode, prompt, images, aspectRatio });
    },
    onSuccess: (generation) => {
      const enhancedPrompt = (generation as { enhancedPrompt?: string }).enhancedPrompt;
      const displayContent = enhancedPrompt 
        ? `✨ Enhanced prompt: ${enhancedPrompt}\n\nHere are the generated assets:`
        : "Here are the generated assets:";
      addMessage({ role: "ai", content: displayContent, assets: generation.outputAssets });
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

  async function handleSend(promptOverride?: string) {
    const prompt = (promptOverride ?? input).trim();
    if (!prompt || generateMutation.isPending) return;
    if (mode === "image-to-image" && attachedImages.length === 0) {
      addToast("error", "Attach an image for image-to-image mode");
      return;
    }

    // Capture image files BEFORE clearing the store
    const currentImageFiles = attachedImages.map((img) => img.file);

    // Convert attached files to data URIs for display in the message bubble
    let imageAttachments: { name: string; preview: string }[] | undefined;
    if (currentImageFiles.length > 0) {
      imageAttachments = await Promise.all(
        currentImageFiles.map(async (file) => ({
          name: file.name,
          preview: await fileToDataURI(file),
        })),
      );
    }

    addMessage({ role: "user", content: prompt, imageAttachments });
    setInput("");
    clearImages();
    addMessage({ role: "ai", content: "Generating..." });
    setLastPrompt(prompt);
    generateMutation.mutate({ prompt, imageFiles: currentImageFiles });
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
    <section className="flex h-[calc(100vh-7rem)] flex-col lg:h-[calc(100vh-7rem)]" style={{ maxHeight: "calc(100dvh - 10rem)" }}>
      {/* Header: trend brief + settings */}
      <div className="flex shrink-0 items-center justify-between gap-3 pb-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge tone="primary">Active campaign</Badge>
              {brandKit && (
                <div className="flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-0.5 border border-surface-elevated">
                  <div className="flex -space-x-0.5">
                    {brandKit.colors?.slice(0, 3).map((color, i) => (
                      <div key={i} className="h-3 w-3 rounded-full border border-white" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <span className="text-xs text-text-muted font-medium">{brandKit.name}</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowCampaignInfo(!showCampaignInfo)}
              className="mt-1 flex items-center gap-1 group"
            >
              <h1 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">{campaign.name}</h1>
              <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${showCampaignInfo ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
        <WorkspaceHeaderActions campaign={campaign} />
      </div>

      {/* Campaign Info Panel (collapsible) */}
      {showCampaignInfo && (
        <div className="mb-3 shrink-0 rounded-card border bg-surface-muted/50 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {campaign.objective && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-1">Objective</p>
                <p className="text-sm text-text-primary">{campaign.objective}</p>
              </div>
            )}
            {campaign.audience && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-1">Target Audience</p>
                <p className="text-sm text-text-primary">{campaign.audience}</p>
              </div>
            )}
            {campaign.tone && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-1">Tone</p>
                <p className="text-sm text-text-primary">{campaign.tone}</p>
              </div>
            )}
            {campaign.channels && campaign.channels.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-1">Channels</p>
                <div className="flex flex-wrap gap-1">
                  {campaign.channels.map((ch) => (
                    <span key={ch} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary-soft">{ch}</span>
                  ))}
                </div>
              </div>
            )}
            {campaign.launchDate && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-1">Launch Date</p>
                <p className="text-sm text-text-primary">{new Date(campaign.launchDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
            )}
            {brandKit && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-1">Brand Voice</p>
                <p className="text-sm text-text-primary">{brandKit.voice}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pinned trend brief */}
      {pinnedTrend && (
        <div className="mb-3 shrink-0 rounded-card border border-accent/30 bg-gradient-to-br from-accent/5 to-accent/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">📈 Trend Brief</p>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                  {pinnedTrend.platform}
                </span>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                  {pinnedTrend.niche}
                </span>
              </div>
              <p className="text-sm font-semibold text-text-primary leading-relaxed">{pinnedTrend.title}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {pinnedTrend.hashtags.map((tag) => (
                  <span key={tag} className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">{tag}</span>
                ))}
              </div>
            </div>
            <button 
              type="button" 
              onClick={dismissTrend} 
              className="shrink-0 rounded-full p-1.5 text-text-muted hover:bg-surface-elevated hover:text-text-primary transition-colors" 
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Quick action buttons */}
          <div className="mt-4 flex flex-wrap gap-2 border-t border-accent/20 pt-3">
            <button
              type="button"
              onClick={() => {
                const prompt = generatePromptFromTrend(pinnedTrend, "default");
                setInput(prompt);
                addToast("success", "Prompt generated from trend");
              }}
              className="flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/25 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate Prompt
            </button>
            <button
              type="button"
              onClick={() => {
                const hashtags = pinnedTrend.hashtags.join(" ");
                navigator.clipboard.writeText(hashtags);
                addToast("success", "Hashtags copied to clipboard");
              }}
              className="flex items-center gap-1.5 rounded-full bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-muted transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Hashtags
            </button>
            <button
              type="button"
              onClick={() => {
                const prompt = generatePromptFromTrend(pinnedTrend, "caption");
                setInput(prompt);
                setMode("text-to-image");
                addToast("success", "Caption prompt ready");
              }}
              className="flex items-center gap-1.5 rounded-full bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-muted transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              Caption
            </button>
            <button
              type="button"
              onClick={() => {
                const prompt = generatePromptFromTrend(pinnedTrend, "image");
                setInput(prompt);
                setMode("text-to-image");
                addToast("success", "Image prompt ready");
              }}
              className="flex items-center gap-1.5 rounded-full bg-surface-elevated px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-muted transition-colors"
            >
              <Image className="h-3.5 w-3.5" />
              Image
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

          {/* Top row: Mode toggle + tools */}
          <div className="flex items-center gap-2 overflow-x-auto border-b px-3 py-2 scrollbar-hide">
            {/* Mode toggle - segmented control style */}
            <div className="flex items-center rounded-control border bg-surface-muted p-0.5">
              <button
                type="button"
                onClick={() => setMode("text-to-image")}
                title="Text to Image - Generate from text prompt"
                aria-label="Text to Image"
                className={`flex items-center gap-1.5 rounded-control px-2.5 py-1.5 text-xs font-medium transition ${
                  mode === "text-to-image"
                    ? "bg-primary/15 text-primary-soft shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <WandSparkles className="h-3.5 w-3.5" />
                <span>Text</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("image-to-image")}
                title="Image to Image - Transform reference image"
                aria-label="Image to Image"
                className={`flex items-center gap-1.5 rounded-control px-2.5 py-1.5 text-xs font-medium transition ${
                  mode === "image-to-image"
                    ? "bg-primary/15 text-primary-soft shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Image className="h-3.5 w-3.5" />
                <span>Image</span>
              </button>
            </div>

            <div className="h-5 w-px bg-border" />

            {/* Aspect ratio */}
            <AspectRatioSelector />

            <div className="h-5 w-px bg-border" />

            {/* Prompt suggestions */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                title="Prompt suggestions"
                aria-label="Prompt suggestions"
                className="flex h-8 items-center gap-1 rounded-control px-2 text-xs text-text-muted transition hover:bg-surface-elevated hover:text-text-primary"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Suggestions</span>
              </button>
              {showSuggestions && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                  <div className="absolute bottom-full left-0 z-50 mb-2 w-64 rounded-card border bg-surface/95 p-2 shadow-soft backdrop-blur-xl">
                    <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-text-muted">Quick prompts</p>
                    {PROMPT_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion.label}
                        type="button"
                        onClick={() => {
                          setInput(suggestion.prompt);
                          setShowSuggestions(false);
                        }}
                        className="flex w-full flex-col rounded-control px-3 py-2 text-left transition hover:bg-surface-elevated"
                      >
                        <span className="text-xs font-medium text-text-primary">{suggestion.label}</span>
                        <span className="text-xs text-text-muted line-clamp-1">{suggestion.prompt}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Image upload (only in image-to-image mode) */}
            {mode === "image-to-image" && (
              <>
                <div className="h-5 w-px bg-border" />
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" multiple className="hidden" onChange={(e) => { const files = Array.from(e.target.files ?? []); if (files.length) { const total = attachedImages.length + files.length; const maxImages = 5; if (total > maxImages) { addToast("error", `Max ${maxImages} images for AI generation — only first ${maxImages - attachedImages.length} will be used`); addImages(files.slice(0, maxImages - attachedImages.length)); } else { addImages(files); } } e.target.value = ""; }} />
                <button type="button" onClick={() => fileInputRef.current?.click()} title="Attach reference images (max 5 for AI)" aria-label="Attach images" className="flex h-8 items-center gap-1 rounded-control px-2 text-xs text-text-muted transition hover:bg-surface-elevated hover:text-text-primary">
                  <ImagePlus className="h-3.5 w-3.5" />
                  <span>Attach{attachedImages.length > 0 ? ` (${attachedImages.length}/5)` : ""}</span>
                </button>
              </>
            )}
          </div>

          {/* Middle row: Textarea */}
          <div className="relative px-3 py-2">
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`; }}
              onKeyDown={handleKeyDown}
              placeholder={mode === "image-to-image" ? "Describe how to transform the image..." : "Describe what you want to generate..."}
              className="min-h-[56px] w-full resize-none bg-transparent text-sm leading-6 text-text-primary outline-none placeholder:text-text-muted/70"
              disabled={generateMutation.isPending}
              rows={1}
            />
          </div>

          {/* Bottom row: Cost + char count + actions */}
          <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
            {/* Left: Cost + char count */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-text-muted shrink-0">
                <DollarSign className="h-3 w-3" />
                <span>~${calculateCost(mode, aspectRatio, attachedImages.length || 1).toFixed(3)}</span>
              </div>
              <span className="hidden sm:inline text-xs text-text-muted/60 shrink-0">
                {mode === "text-to-image" ? "Flux Schnell" : attachedImages.length > 1 ? `Flux Kontext Multi (${attachedImages.length} images)` : "Flux Kontext Pro"}
              </span>
              {input.length > 0 && (
                <span className="hidden sm:inline text-xs text-text-muted shrink-0">
                  {input.length} char{input.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5">
              {/* Clear button */}
              {input.length > 0 && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  title="Clear input"
                  aria-label="Clear input"
                  className="flex h-8 w-8 items-center justify-center rounded-control text-text-muted transition hover:bg-surface-elevated hover:text-text-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Model selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowModelPicker(!showModelPicker)}
                  title={`Model: ${aiModels.find((m) => m.id === model)?.label}`}
                  aria-label="Select AI model"
                  className="flex h-8 w-8 items-center justify-center rounded-control text-text-muted transition hover:bg-surface-elevated hover:text-text-primary"
                >
                  <Cpu className="h-3.5 w-3.5" />
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

              {/* Regenerate button */}
              {lastPrompt && (
                <button
                  type="button"
                  onClick={() => handleSend(lastPrompt)}
                  title="Regenerate with last prompt"
                  aria-label="Regenerate"
                  disabled={generateMutation.isPending}
                  className="flex h-8 w-8 items-center justify-center rounded-control text-text-muted transition hover:bg-surface-elevated hover:text-text-primary disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${generateMutation.isPending ? "animate-spin" : ""}`} />
                </button>
              )}

              {/* Send button */}
              <Button
                size="sm"
                onClick={() => handleSend()}
                disabled={!input.trim() || generateMutation.isPending}
                className="h-8 px-3"
              >
                {generateMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
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
  const addToast = useToastStore((s) => s.addToast);
  const [copied, setCopied] = useState(false);

  // Extract enhanced prompt if present
  const enhancedPromptMatch = !isUser && message.content.match(/✨ Enhanced prompt: ([\s\S]+?)\n\nHere are the generated assets:/);
  const enhancedPrompt = enhancedPromptMatch ? enhancedPromptMatch[1].trim() : null;
  const displayContent = enhancedPromptMatch ? message.content.replace(/✨ Enhanced prompt: [\s\S]+?\n\nHere are the generated assets:/, "").trim() : message.content;

  async function handleCopyPrompt() {
    if (!enhancedPrompt) return;
    try {
      await navigator.clipboard.writeText(enhancedPrompt);
      setCopied(true);
      addToast("success", "Prompt copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("error", "Failed to copy prompt");
    }
  }

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
          <Bot className="h-4 w-4 text-primary-soft" />
        </div>
      )}
      <div className={`w-full max-w-[90%] space-y-3 ${isUser ? "items-end" : ""}`}>
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-6 ${isUser ? "bg-primary/14 text-text-primary" : "bg-surface-elevated text-text-muted"}`}>
          {enhancedPrompt && (
            <div className="mb-2 rounded-lg bg-surface/80 p-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-text-primary flex-1 whitespace-pre-wrap">{enhancedPrompt}</p>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="shrink-0 rounded-control p-1.5 text-text-muted hover:bg-surface-elevated hover:text-text-primary transition-colors"
                  aria-label="Copy prompt"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          )}
          {displayContent}
          {message.imageAttachments && message.imageAttachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {message.imageAttachments.map((img, i) => (
                <img key={i} src={img.preview} alt={img.name} className="h-16 w-16 rounded-lg object-cover border border-white/20" />
              ))}
            </div>
          )}
        </div>
        {message.assets && message.assets.length > 0 && (
          <div className={`grid gap-3 ${message.assets.length === 1 ? "grid-cols-1 max-w-md" : message.assets.length === 2 ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3"}`}>
            {message.assets.map((asset) => (
              <div key={asset.id}>
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
                <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(gen.id); }} aria-label="Delete" className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-100 transition hover:bg-error md:opacity-0 md:group-hover:opacity-100">
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
