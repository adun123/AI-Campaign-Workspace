import { create } from "zustand";
import type { Asset, GenerationMode } from "@/types/domain";

export type AIModel = "auto" | "dall-e" | "midjourney" | "stable-diffusion" | "gemini-imagen" | "firefly";

export const aiModels: { id: AIModel; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "dall-e", label: "DALL·E" },
  { id: "midjourney", label: "Midjourney" },
  { id: "stable-diffusion", label: "Stable Diffusion" },
  { id: "gemini-imagen", label: "Gemini Imagen" },
  { id: "firefly", label: "Adobe Firefly" },
];

export type AttachedFile = { id: string; file: File; preview: string };

export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: string;
  assets?: Asset[];
  imageAttachments?: string[]; // filenames for display
  timestamp: string;
};

type ChatState = {
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  loadHistory: (msgs: ChatMessage[]) => void;
  mode: GenerationMode;
  setMode: (mode: GenerationMode) => void;
  model: AIModel;
  setModel: (model: AIModel) => void;
  attachedImages: AttachedFile[];
  addImages: (files: File[]) => void;
  removeImage: (id: string) => void;
  clearImages: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: "welcome",
      role: "ai",
      content: "Tell me what you want to launch. I'll keep the brand kit, channels, and campaign settings in context.",
      timestamp: new Date().toISOString(),
    },
  ],
  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, timestamp: new Date().toISOString() },
      ],
    })),
  loadHistory: (msgs) => set({ messages: msgs }),
  mode: "text-to-image",
  setMode: (mode) => set({ mode }),
  model: "auto",
  setModel: (model) => set({ model }),
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
