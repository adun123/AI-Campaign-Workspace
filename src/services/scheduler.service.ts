import { scheduledPosts } from "@/lib/mock-data";
import { waitForMock } from "@/services/mock-runtime";
import type { Asset, CampaignChannel, ID, ScheduledPost } from "@/types/domain";

export type SchedulePostInput = {
  campaignId: ID;
  assetId: ID;
  channel: CampaignChannel;
  date: string;
  time: string;
};

let posts = [...scheduledPosts];

export async function listScheduledPosts() {
  await waitForMock(260);
  return posts;
}

export async function scheduleAsset(asset: Asset) {
  await waitForMock(320);
  const post: ScheduledPost = {
    id: `post_${Date.now()}`,
    campaignId: asset.campaignId,
    assetId: asset.id,
    channel: asset.channel,
    publishAt: "2026-06-14T15:00:00.000Z",
    status: "scheduled",
  };
  posts = [post, ...posts];
  return post;
}

export async function createScheduledPost(input: SchedulePostInput) {
  await waitForMock(320);
  const post: ScheduledPost = {
    id: `post_${Date.now()}`,
    campaignId: input.campaignId,
    assetId: input.assetId,
    channel: input.channel,
    publishAt: `${input.date}T${input.time}:00.000Z`,
    status: "scheduled",
  };
  posts = [post, ...posts];
  return post;
}

export async function deleteScheduledPost(id: ID) {
  await waitForMock(200);
  posts = posts.filter((p) => p.id !== id);
}
