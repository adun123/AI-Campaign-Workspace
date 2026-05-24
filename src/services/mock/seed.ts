import type {
  AIGeneration,
  Asset,
  BrandKit,
  Campaign,
  ScheduledPost,
  User,
  Workspace,
} from "@/types";

const now = () => new Date().toISOString();
const past = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
const future = (daysAhead: number) =>
  new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

export const seedUser: User = {
  id: "user_1",
  name: "Alex Rivera",
  email: "alex@studio.co",
  avatarUrl: undefined,
  role: "owner",
  createdAt: past(120),
};

export const seedWorkspace: Workspace = {
  id: "ws_1",
  name: "Northwind Studio",
  slug: "northwind",
  plan: "agency",
  ownerId: seedUser.id,
  memberIds: [seedUser.id],
  createdAt: past(120),
};

export const seedBrandKits: BrandKit[] = [
  {
    id: "bk_1",
    workspaceId: seedWorkspace.id,
    name: "Northwind Core",
    colors: [
      { name: "Ink", hex: "#0A0A0B" },
      { name: "Iris", hex: "#7C3AED" },
      { name: "Sky", hex: "#60A5FA" },
      { name: "Bone", hex: "#F5F7FA" },
    ],
    typography: { headingFont: "Geist", bodyFont: "Inter" },
    voice: {
      tone: ["confident", "calm", "precise"],
      doList: ["Lead with the outcome", "Use plain language", "Show, don't tell"],
      dontList: ["Avoid hype words", "Don't oversell", "No emoji spam"],
    },
    createdAt: past(60),
    updatedAt: past(3),
  },
];

export const seedCampaigns: Campaign[] = [
  {
    id: "camp_1",
    workspaceId: seedWorkspace.id,
    name: "Spring Launch — Atlas Headphones",
    description:
      "Multi-channel launch for the Atlas wireless headphones. Lead with comfort, finish with audio quality.",
    status: "active",
    objective: "launch",
    channels: ["instagram", "tiktok", "x", "youtube"],
    brandKitId: "bk_1",
    ownerId: seedUser.id,
    collaboratorIds: [seedUser.id],
    startDate: past(7),
    endDate: future(21),
    coverColor: "#7C3AED",
    createdAt: past(14),
    updatedAt: past(1),
  },
  {
    id: "camp_2",
    workspaceId: seedWorkspace.id,
    name: "Always-On — Brand Awareness",
    description: "Evergreen content engine. Two posts per channel, per week.",
    status: "active",
    objective: "awareness",
    channels: ["instagram", "linkedin", "blog"],
    brandKitId: "bk_1",
    ownerId: seedUser.id,
    collaboratorIds: [seedUser.id],
    startDate: past(60),
    coverColor: "#60A5FA",
    createdAt: past(60),
    updatedAt: past(2),
  },
  {
    id: "camp_3",
    workspaceId: seedWorkspace.id,
    name: "Q3 Newsletter Refresh",
    description: "Rework the weekly newsletter into three thematic streams.",
    status: "draft",
    objective: "retention",
    channels: ["email"],
    brandKitId: "bk_1",
    ownerId: seedUser.id,
    collaboratorIds: [seedUser.id],
    coverColor: "#8B5CF6",
    createdAt: past(4),
    updatedAt: past(1),
  },
];

export const seedAssets: Asset[] = [
  {
    id: "asset_1",
    campaignId: "camp_1",
    workspaceId: seedWorkspace.id,
    type: "image",
    title: "Atlas — hero shot, studio light",
    url: "https://picsum.photos/seed/atlas-1/800/800",
    thumbnailUrl: "https://picsum.photos/seed/atlas-1/400/400",
    dimensions: { width: 1080, height: 1080 },
    tags: ["hero", "product", "studio"],
    saved: true,
    createdAt: past(3),
    updatedAt: past(3),
  },
  {
    id: "asset_2",
    campaignId: "camp_1",
    workspaceId: seedWorkspace.id,
    type: "image",
    title: "Atlas — lifestyle, café",
    url: "https://picsum.photos/seed/atlas-2/800/1000",
    thumbnailUrl: "https://picsum.photos/seed/atlas-2/400/500",
    dimensions: { width: 1080, height: 1350 },
    tags: ["lifestyle"],
    saved: true,
    createdAt: past(3),
    updatedAt: past(3),
  },
  {
    id: "asset_3",
    campaignId: "camp_1",
    workspaceId: seedWorkspace.id,
    type: "caption",
    title: "Launch caption — Instagram",
    content:
      "Comfort that disappears. Sound that doesn't. Atlas is built for the way you actually listen — for hours, not minutes.",
    tags: ["caption", "instagram"],
    saved: true,
    createdAt: past(2),
    updatedAt: past(2),
  },
  {
    id: "asset_4",
    campaignId: "camp_2",
    workspaceId: seedWorkspace.id,
    type: "copy",
    title: "LinkedIn thought-leadership opener",
    content:
      "Most product launches fail in the first 72 hours, not because the product is wrong — because the story is.",
    tags: ["linkedin", "long-form"],
    saved: true,
    createdAt: past(1),
    updatedAt: past(1),
  },
];

export const seedGenerations: AIGeneration[] = [
  {
    id: "gen_1",
    campaignId: "camp_1",
    status: "succeeded",
    params: {
      prompt: "Hero shot of Atlas headphones on matte stone, studio lighting.",
      outputType: "image",
      model: "image-v1",
      options: { aspectRatio: "1:1", variations: 2, brandKitId: "bk_1" },
    },
    resultAssetIds: ["asset_1", "asset_2"],
    progress: 1,
    createdAt: past(3),
    updatedAt: past(3),
  },
  {
    id: "gen_2",
    campaignId: "camp_1",
    status: "succeeded",
    params: {
      prompt: "Three Instagram captions, confident tone, lead with comfort.",
      outputType: "caption",
      model: "copy-v1",
      options: { tone: "confident", variations: 3 },
    },
    resultAssetIds: ["asset_3"],
    progress: 1,
    createdAt: past(2),
    updatedAt: past(2),
  },
];

export const seedScheduled: ScheduledPost[] = [
  {
    id: "sch_1",
    workspaceId: seedWorkspace.id,
    campaignId: "camp_1",
    assetId: "asset_1",
    channel: "instagram",
    caption: "Comfort that disappears. Sound that doesn't.",
    scheduledFor: future(1),
    status: "scheduled",
    createdAt: past(1),
    updatedAt: past(1),
  },
  {
    id: "sch_2",
    workspaceId: seedWorkspace.id,
    campaignId: "camp_1",
    assetId: "asset_2",
    channel: "tiktok",
    scheduledFor: future(3),
    status: "scheduled",
    createdAt: now(),
    updatedAt: now(),
  },
];
