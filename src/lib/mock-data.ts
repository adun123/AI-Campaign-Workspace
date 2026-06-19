import type { AIGeneration, Asset, BrandKit, Campaign, ScheduledPost, User, Workspace } from "@/types/domain";

export const currentUser: User = {
  id: "user_01",
  name: "Maya Putri",
  email: "maya@wetech.studio",
  avatarInitials: "MP",
};

export const currentWorkspace: Workspace = {
  id: "workspace_01",
  name: "Wetech Growth Studio",
  plan: "studio",
  userId: currentUser.id,
};

export const campaigns: Campaign[] = [
  {
    id: "campaign_01",
    workspaceId: currentWorkspace.id,
    name: "Kaiva Launch Sprint",
    objective: "Launch an AI productivity workspace to design-forward founders.",
    audience: "Seed-stage SaaS operators who need polished campaign assets fast.",
    tone: "Calm, precise, premium, editorial.",
    status: "active",
    channels: ["LinkedIn", "Instagram", "Email"],
    launchDate: "2026-06-12",
    createdAt: "2026-05-20T08:30:00.000Z",
  },
];

export const brandKits: BrandKit[] = [
  {
    id: "brand_01",
    workspaceId: currentWorkspace.id,
    name: "Kaiva",
    voice: "Confident, concise, and thoughtful. Avoid hype and generic AI promises.",
    colors: ["#0A0A0B", "#111214", "#7C3AED", "#60A5FA", "#F5F7FA"],
    logoUrl: "KV",
    guardrails: ["No cartoon robots", "Prefer product context over abstract magic", "Keep copy under 24 words per frame"],
    logoEnabled: false,
    logoPosition: "bottom-right",
    logoSizePercent: 15,
    voiceEnabled: true,
    colorsEnabled: true,
    guardrailsEnabled: true,
    typography: "",
    typographyEnabled: false,
    brandValues: [],
    brandValuesEnabled: false,
  },
];

export const assets: Asset[] = [
  {
    id: "asset_01",
    campaignId: "campaign_01",
    title: "Founder Desk Hero",
    kind: "image",
    prompt: "A cinematic dark workspace with product UI reflections, quiet confidence, no people.",
    preview: "bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.55),transparent_32%),linear-gradient(135deg,#17181c,#0a0a0b_62%,#1d2540)]",
    channel: "LinkedIn",
    status: "saved",
    createdAt: "2026-05-22T10:00:00.000Z",
  },
  {
    id: "asset_02",
    campaignId: "campaign_01",
    title: "Three-frame Carousel Hook",
    kind: "carousel",
    prompt: "Turn planning chaos into one calm campaign workspace.",
    preview: "bg-[radial-gradient(circle_at_80%_10%,rgba(96,165,250,0.45),transparent_30%),linear-gradient(135deg,#111214,#181b24)]",
    channel: "Instagram",
    status: "draft",
    createdAt: "2026-05-22T10:08:00.000Z",
  },
  {
    id: "asset_03",
    campaignId: "campaign_01",
    title: "Launch Email Opener",
    kind: "caption",
    prompt: "Your campaign room should feel like a strategy partner, not a file dump.",
    preview: "bg-[linear-gradient(135deg,#111214,#121826_55%,#0a0a0b)]",
    channel: "Email",
    status: "scheduled",
    createdAt: "2026-05-22T10:12:00.000Z",
  },
];

export const generations: AIGeneration[] = [
  {
    id: "generation_01",
    campaignId: "campaign_01",
    mode: "text-to-image",
    prompt: "Premium launch visuals for a calm AI planning workspace.",
    status: "completed",
    outputAssets: assets.slice(0, 2),
    createdAt: "2026-05-22T09:54:00.000Z",
    completedAt: "2026-05-22T09:55:00.000Z",
  },
  {
    id: "generation_02",
    campaignId: "campaign_01",
    mode: "image-to-image",
    prompt: "Refine the hero into a more editorial product shot with cooler light.",
    status: "completed",
    sourceAssetId: "asset_01",
    outputAssets: [assets[0]],
    createdAt: "2026-05-22T10:02:00.000Z",
    completedAt: "2026-05-22T10:03:00.000Z",
  },
];

export const scheduledPosts: ScheduledPost[] = [
  {
    id: "post_01",
    campaignId: "campaign_01",
    assetId: "asset_03",
    channel: "Email",
    publishAt: "2026-06-10T09:00:00.000Z",
    status: "scheduled",
  },
  {
    id: "post_02",
    campaignId: "campaign_01",
    assetId: "asset_01",
    channel: "LinkedIn",
    publishAt: "2026-06-12T14:30:00.000Z",
    status: "scheduled",
  },
];
