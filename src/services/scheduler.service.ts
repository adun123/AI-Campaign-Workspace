import type { ID, ScheduledPost } from "@/types";
import { delay, jitter } from "@/lib/delay";
import { createId } from "@/lib/id";
import { clone, getDB } from "./mock/db";

export interface SchedulerListFilter {
  campaignId?: ID;
  from?: string;
  to?: string;
}

export interface SchedulerService {
  list(filter?: SchedulerListFilter): Promise<ScheduledPost[]>;
  schedule(input: Omit<ScheduledPost, "id" | "createdAt" | "updatedAt">): Promise<ScheduledPost>;
  reschedule(id: ID, scheduledFor: string): Promise<ScheduledPost>;
  cancel(id: ID): Promise<void>;
}

export const schedulerService: SchedulerService = {
  async list(filter) {
    await delay(jitter(150, 300));
    let items = getDB().scheduled;
    if (filter?.campaignId) items = items.filter((s) => s.campaignId === filter.campaignId);
    if (filter?.from) items = items.filter((s) => s.scheduledFor >= filter.from!);
    if (filter?.to) items = items.filter((s) => s.scheduledFor <= filter.to!);
    return clone(items.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor)));
  },

  async schedule(input) {
    await delay(jitter(200, 400));
    const now = new Date().toISOString();
    const post: ScheduledPost = {
      ...input,
      id: createId("sch"),
      createdAt: now,
      updatedAt: now,
    };
    getDB().scheduled.unshift(post);
    return clone(post);
  },

  async reschedule(id, scheduledFor) {
    await delay(jitter(150, 300));
    const db = getDB();
    const idx = db.scheduled.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Scheduled post ${id} not found`);
    const existing = db.scheduled[idx];
    if (!existing) throw new Error(`Scheduled post ${id} not found`);
    const next: ScheduledPost = {
      ...existing,
      scheduledFor,
      status: "scheduled",
      updatedAt: new Date().toISOString(),
    };
    db.scheduled[idx] = next;
    return clone(next);
  },

  async cancel(id) {
    await delay(jitter(100, 250));
    const db = getDB();
    db.scheduled = db.scheduled.filter((s) => s.id !== id);
  },
};
