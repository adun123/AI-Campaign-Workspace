import type { ID, ISODateString } from "./common";
import type { AssetType } from "./asset";

/**
 * Lifecycle of a single AI generation job.
 * Maps directly onto UI states (idle / queued / loading / streaming / success / error).
 */
export type AIGenerationStatus =
  | "idle"
  | "queued"
  | "running"
  | "streaming"
  | "succeeded"
  | "failed"
  | "cancelled";

export type AIModel =
  | "ideation-v1"
  | "copy-v1"
  | "image-v1"
  | "video-v1";

export interface AIGenerationParams {
  /** Free-form user prompt. */
  prompt: string;
  /** Output type drives which renderer the workspace uses. */
  outputType: AssetType;
  model: AIModel;
  /** Optional knob set; the right-side properties panel writes here. */
  options?: {
    tone?: string;
    style?: string;
    aspectRatio?: "1:1" | "4:5" | "9:16" | "16:9";
    variations?: number;
    brandKitId?: ID;
  };
}

export interface AIMessage {
  id: ID;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: ISODateString;
  /** When the assistant message produced assets, they are attached. */
  assetIds?: ID[];
}

export interface AIGeneration {
  id: ID;
  campaignId: ID;
  status: AIGenerationStatus;
  params: AIGenerationParams;
  /** Produced assets — empty until status becomes succeeded. */
  resultAssetIds: ID[];
  /** Optional error info for retry UX. */
  error?: { code: string; message: string };
  /** Numeric progress 0..1 for streaming/running states. */
  progress?: number;
  /** When this generation is part of an ideation thread. */
  parentMessageId?: ID;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
