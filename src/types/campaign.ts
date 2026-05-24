import type { ID, ISODateString } from "./common";

export type CampaignStatus = "draft" | "active" | "paused" | "archived";

export type CampaignChannel =
  | "instagram"
  | "tiktok"
  | "x"
  | "linkedin"
  | "youtube"
  | "email"
  | "blog"
  | "ads";

export type CampaignObjective =
  | "awareness"
  | "engagement"
  | "conversion"
  | "retention"
  | "launch";

export interface Campaign {
  id: ID;
  workspaceId: ID;
  name: string;
  description: string;
  status: CampaignStatus;
  objective: CampaignObjective;
  channels: CampaignChannel[];
  brandKitId?: ID;
  ownerId: ID;
  collaboratorIds: ID[];
  startDate?: ISODateString;
  endDate?: ISODateString;
  coverColor?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
