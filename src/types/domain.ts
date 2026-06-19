export type ID = string;

export type User = {
  id: ID;
  name: string;
  email: string;
  avatarInitials: string;
};

export type Workspace = {
  id: ID;
  name: string;
  plan: "starter" | "pro" | "studio";
  userId: ID;
};

export type CampaignChannel = "Instagram" | "LinkedIn" | "TikTok" | "Email";

export type Campaign = {
  id: ID;
  workspaceId: ID;
  name: string;
  objective: string;
  audience: string;
  tone: string;
  status: "draft" | "active" | "scheduled";
  channels: CampaignChannel[];
  launchDate: string;
  createdAt: string;
};

export type LogoPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type BrandKit = {
  id: ID;
  workspaceId: ID;
  name: string;
  voice: string;
  colors: string[];
  logoUrl: string;
  guardrails: string[];
  // Logo overlay
  logoEnabled: boolean;
  logoPosition: LogoPosition;
  logoSizePercent: number;
  // Toggles
  voiceEnabled: boolean;
  colorsEnabled: boolean;
  guardrailsEnabled: boolean;
  // New fields
  typography: string;
  typographyEnabled: boolean;
  brandValues: string[];
  brandValuesEnabled: boolean;
};

export type GenerationMode = "text-to-image" | "image-to-image";

export type AIGenerationStatus = "queued" | "processing" | "completed" | "error" | "retry";

export type AssetKind = "image" | "caption" | "carousel";

export type Asset = {
  id: ID;
  campaignId: ID;
  title: string;
  kind: AssetKind;
  prompt: string;
  preview: string;
  channel: CampaignChannel;
  status: "draft" | "saved" | "scheduled";
  createdAt: string;
};

export type AIGeneration = {
  id: ID;
  campaignId: ID;
  mode: GenerationMode;
  prompt: string;
  status: AIGenerationStatus;
  sourceAssetId?: ID;
  outputAssets: Asset[];
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  enhancedPrompt?: string;
};

export type ScheduledPost = {
  id: ID;
  campaignId: ID;
  assetId: ID;
  channel: CampaignChannel;
  publishAt: string;
  status: "draft" | "scheduled" | "published";
};
