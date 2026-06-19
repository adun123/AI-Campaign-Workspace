import { create } from "zustand";
import type { Asset, GenerationMode } from "@/types/domain";

export type AIModel = 
  | "nano-banana-2" 
  | "nano-banana-2-edit" 
  | "nano-banana-pro-edit" 
  | "gpt-image-2-edit" 
  | "seedream-v5-lite" 
  | "flux-schnell";

export type ImageResolution = "0.5k" | "1k" | "2k" | "4k";
export type ImageQuality = "auto" | "low" | "medium" | "high";
export type AspectRatioOption = "auto" | "length" | "1:1" | "4:5" | "9:16" | "16:9";

export type ModelCapability = {
  id: AIModel;
  label: string;
  description: string;
  pricePerImage: number;
  acceptsImages: boolean;
  maxImages?: number;
  resolutions?: ImageResolution[];
  aspectRatios?: AspectRatioOption[];
  qualityLevels?: ImageQuality[];
};

export type StylePreset = "none" | "photorealistic" | "minimalist" | "bold" | "creative";

export const stylePresets: { id: StylePreset; label: string; description: string }[] = [
  { id: "none", label: "Normal", description: "No style applied" },
  { id: "photorealistic", label: "Photorealistic", description: "Realistic photography, natural lighting" },
  { id: "minimalist", label: "Minimalist", description: "Clean, simple, minimalist design" },
  { id: "bold", label: "Bold", description: "Vibrant colors, high contrast, impactful" },
  { id: "creative", label: "Creative", description: "Artistic, unique, unconventional" },
];

export const aiModels: ModelCapability[] = [
  {
    id: "nano-banana-2",
    label: "Nano Banana 2",
    description: "Google's state-of-the-art text-to-image model",
    pricePerImage: 0.08,
    acceptsImages: false,
    resolutions: ["0.5k", "1k", "2k", "4k"],
    aspectRatios: ["auto", "length"],
  },
  {
    id: "nano-banana-2-edit",
    label: "Nano Banana 2 Edit",
    description: "Image editing with Google's Nano Banana 2 model",
    pricePerImage: 0.08,
    acceptsImages: true,
    maxImages: 10,
    resolutions: ["0.5k", "1k", "2k", "4k"],
    aspectRatios: ["auto", "length"],
  },
  {
    id: "nano-banana-pro-edit",
    label: "Nano Banana Pro Edit",
    description: "Premium image editing with Google's Pro model",
    pricePerImage: 0.15,
    acceptsImages: true,
    maxImages: 10,
    resolutions: ["0.5k", "1k", "2k", "4k"],
    aspectRatios: ["auto", "length"],
  },
  {
    id: "gpt-image-2-edit",
    label: "GPT Image 2 Edit",
    description: "Advanced image editing with OpenAI's GPT Image 2",
    pricePerImage: 0.10,
    acceptsImages: true,
    maxImages: 10,
    qualityLevels: ["auto", "low", "medium", "high"],
  },
  {
    id: "seedream-v5-lite",
    label: "Seedream v5 Lite",
    description: "Fast & budget-friendly image editing for ads",
    pricePerImage: 0.035,
    acceptsImages: true,
    maxImages: 5,
  },
  {
    id: "flux-schnell",
    label: "Flux Schnell",
    description: "Fast text-to-image generation",
    pricePerImage: 0.003,
    acceptsImages: false,
    resolutions: ["1k"],
    aspectRatios: ["1:1", "4:5", "9:16", "16:9"],
  },
];

export type AttachedFile = { id: string; file: File; preview: string };

export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  assets?: Asset[];
  imageAttachments?: { name: string; preview: string }[]; // image previews for display
  timestamp: string;
};

type ChatState = {
  // Per-campaign messages storage
  campaignMessages: Record<string, ChatMessage[]>;
  currentCampaignId: string | null;

  // Current active messages (derived from campaignMessages)
  messages: ChatMessage[];

  // Actions
  setCampaign: (campaignId: string) => void;
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  loadHistory: (msgs: ChatMessage[]) => void;
  clearCampaignChat: (campaignId: string) => void;

  // Mode and model
  mode: GenerationMode;
  setMode: (mode: GenerationMode) => void;
  model: AIModel;
  setModel: (model: AIModel) => void;
  aspectRatio: string;
  setAspectRatio: (ar: string) => void;

  // Batch and Style
  batchCount: 1 | 2 | 4;
  setBatchCount: (count: 1 | 2 | 4) => void;
  stylePreset: StylePreset;
  setStylePreset: (style: StylePreset) => void;

  // Model-specific settings
  resolution: ImageResolution;
  setResolution: (res: ImageResolution) => void;
  quality: ImageQuality;
  setQuality: (q: ImageQuality) => void;

  // Image attachments
  attachedImages: AttachedFile[];
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
};

function getWelcomeMessage(): ChatMessage {
  return {
    id: "welcome",
    role: "ai",
    content: "Tell me what you want to launch. I'll keep the brand kit, channels, and campaign settings in context.",
    timestamp: new Date().toISOString(),
  };
}

export const useChatStore = create<ChatState>((set, get) => ({
  campaignMessages: {},
  currentCampaignId: null,
  messages: [getWelcomeMessage()],

  setCampaign: (campaignId: string) => {
    const state = get();
    const existingMessages = state.campaignMessages[campaignId];

    set({
      currentCampaignId: campaignId,
      messages: existingMessages ?? [getWelcomeMessage()],
      attachedImages: [],
    });
  },

  addMessage: (msg) => {
    const state = get();
    if (!state.currentCampaignId) return;

    const newMessage: ChatMessage = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    const currentMessages = state.campaignMessages[state.currentCampaignId] ?? [getWelcomeMessage()];
    const updatedMessages = [...currentMessages, newMessage];

    set({
      messages: updatedMessages,
      campaignMessages: {
        ...state.campaignMessages,
        [state.currentCampaignId]: updatedMessages,
      },
    });
  },

  loadHistory: (msgs) => {
    const state = get();
    if (!state.currentCampaignId) return;

    set({
      messages: msgs,
      campaignMessages: {
        ...state.campaignMessages,
        [state.currentCampaignId]: msgs,
      },
    });
  },

  clearCampaignChat: (campaignId: string) => {
    const state = get();
    const newCampaignMessages = { ...state.campaignMessages };
    delete newCampaignMessages[campaignId];

    const isActive = state.currentCampaignId === campaignId;
    set({
      campaignMessages: newCampaignMessages,
      ...(isActive ? { messages: [getWelcomeMessage()] } : {}),
    });
  },

  mode: "text-to-image",
  setMode: (mode) => set({ mode }),
  model: "nano-banana-2",
  setModel: (model) => set({ model }),
  aspectRatio: "1:1" as string,
  setAspectRatio: (ar: string) => set({ aspectRatio: ar }),

  batchCount: 1,
  setBatchCount: (count) => set({ batchCount: count }),
  stylePreset: "none",
  setStylePreset: (style) => set({ stylePreset: style }),

  // Model-specific settings
  resolution: "1k" as ImageResolution,
  setResolution: (res) => set({ resolution: res }),
  quality: "auto" as ImageQuality,
  setQuality: (q) => set({ quality: q }),

  attachedImages: [],
  addImages: (files) =>
    set((state) => {
      const remaining = 20 - state.attachedImages.length;
      const toAdd = files.slice(0, remaining).map((file) => ({
        id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        file,
        preview: URL.createObjectURL(file),
      }));
      return { attachedImages: [...state.attachedImages, ...toAdd] };
    }),
  removeImage: (id) =>
    set((state) => {
      const img = state.attachedImages.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return { attachedImages: state.attachedImages.filter((i) => i.id !== id) };
    }),
  clearImages: () =>
    set((state) => {
      state.attachedImages.forEach((i) => URL.revokeObjectURL(i.preview));
      return { attachedImages: [] };
    }),
}));
