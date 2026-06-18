import type { CampaignChannel, ID, ScheduledPost } from "@/types/domain";

export type SchedulePostInput = {
  campaignId: ID;
  assetId: ID;
  channel: CampaignChannel;
  date: string;
  time: string;
};

export async function listScheduledPosts(): Promise<ScheduledPost[]> {
  const res = await fetch("/api/scheduler");
  if (!res.ok) throw new Error("Gagal mengambil scheduled posts.");
  return res.json();
}

export async function createScheduledPost(input: SchedulePostInput): Promise<ScheduledPost> {
  const res = await fetch("/api/scheduler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      campaign_id: input.campaignId,
      asset_id: input.assetId,
      channel: input.channel,
      publish_at: `${input.date}T${input.time}:00.000Z`,
    }),
  });
  if (!res.ok) throw new Error("Gagal membuat scheduled post.");
  return res.json();
}

export async function deleteScheduledPost(id: ID): Promise<void> {
  const res = await fetch(`/api/scheduler/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus scheduled post.");
}


export async function scheduleAsset(input: SchedulePostInput): Promise<ScheduledPost> {
  return createScheduledPost(input);
}