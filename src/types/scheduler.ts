import type { ID, ISODateString } from "./common";
import type { CampaignChannel } from "./campaign";

export type ScheduleStatus = "draft" | "scheduled" | "publishing" | "published" | "failed";

export interface ScheduledPost {
  id: ID;
  workspaceId: ID;
  campaignId: ID;
  assetId: ID;
  channel: CampaignChannel;
  caption?: string;
  scheduledFor: ISODateString;
  status: ScheduleStatus;
  publishedAt?: ISODateString;
  error?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
