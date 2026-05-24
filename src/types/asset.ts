import type { ID, ISODateString } from "./common";

export type AssetType = "image" | "video" | "copy" | "caption" | "thread";

export interface AssetDimensions {
  width: number;
  height: number;
}

export interface Asset {
  id: ID;
  campaignId?: ID;
  workspaceId: ID;
  type: AssetType;
  title: string;
  /** Inline content (copy/caption/thread). */
  content?: string;
  /** Resolved URL (image/video). */
  url?: string;
  thumbnailUrl?: string;
  dimensions?: AssetDimensions;
  tags: string[];
  /** Reference back to the AI generation that produced this asset. */
  generationId?: ID;
  saved: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
