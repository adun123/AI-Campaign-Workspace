import type { CampaignChannel, ID, ScheduledPost } from "@/types/domain";

export type SchedulePostInput = {
  campaignId: ID;
  assetId: ID;
  channel: CampaignChannel;
  date: string;
  time: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapScheduledPost(row: any): ScheduledPost {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    assetId: row.asset_id,
    channel: row.channel,
    publishAt: row.publish_at,
    status: row.status,
  };
}

export async function listScheduledPosts(): Promise<ScheduledPost[]> {
  const res = await fetch("/api/scheduler");
  if (!res.ok) throw new Error("Gagal mengambil scheduled posts.");
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapScheduledPost) : [];
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
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? "Gagal membuat scheduled post.");
  }
  const data = await res.json();
  return mapScheduledPost(data);
}

export async function deleteScheduledPost(id: ID): Promise<void> {
  const res = await fetch(`/api/scheduler/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Gagal menghapus scheduled post.");
}


export async function scheduleAsset(input: SchedulePostInput): Promise<ScheduledPost> {
  return createScheduledPost(input);
}

export type UpdateScheduledPostInput = {
  channel?: CampaignChannel;
  date?: string;
  time?: string;
  status?: ScheduledPost["status"];
};

export async function updateScheduledPost(id: ID, input: UpdateScheduledPostInput): Promise<ScheduledPost> {
  const body: Record<string, unknown> = {};
  if (input.channel) body.channel = input.channel;
  if (input.date && input.time) body.publish_at = `${input.date}T${input.time}:00`;
  if (input.status) body.status = input.status;

  const res = await fetch(`/api/scheduler/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? "Gagal mengupdate scheduled post.");
  }
  const data = await res.json();
  return mapScheduledPost(data);
}

export async function updateScheduledPostStatus(id: ID, status: ScheduledPost["status"]): Promise<ScheduledPost> {
  return updateScheduledPost(id, { status });
}