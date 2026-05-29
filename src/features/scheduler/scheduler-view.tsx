"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/shared/section-heading";
import { useAssetsQuery, useScheduledPostsQuery } from "@/hooks/use-workspace-data";
import { createScheduledPost, deleteScheduledPost } from "@/services/scheduler.service";
import { useToastStore } from "@/stores/toast-store";
import { cn } from "@/lib/utils";
import type { CampaignChannel, ScheduledPost } from "@/types/domain";

const schedulerSchema = z.object({
  assetId: z.string().min(1, "Choose an asset."),
  channel: z.enum(["Instagram", "LinkedIn", "TikTok", "Email"]),
  date: z.string().min(1, "Choose a date."),
  time: z.string().min(1, "Choose a time."),
});

type SchedulerFormValues = z.infer<typeof schedulerSchema>;

const statusTone: Record<ScheduledPost["status"], "neutral" | "warning" | "accent" | "success"> = { draft: "neutral", scheduled: "accent", published: "success" };
const channels: CampaignChannel[] = ["Instagram", "LinkedIn", "TikTok", "Email"];

export function SchedulerView() {
  const queryClient = useQueryClient();
  const postsQuery = useScheduledPostsQuery();
  const assetsQuery = useAssetsQuery();
  const assets = assetsQuery.data ?? [];
  const posts = postsQuery.data ?? [];
  const addToast = useToastStore((s) => s.addToast);

  const [statusFilter, setStatusFilter] = useState<ScheduledPost["status"] | "all">("all");
  const [channelFilter, setChannelFilter] = useState<CampaignChannel | "all">("all");

  const form = useForm<SchedulerFormValues>({
    resolver: zodResolver(schedulerSchema),
    values: { assetId: assets[0]?.id ?? "", channel: assets[0]?.channel ?? "LinkedIn", date: "2026-06-14", time: "15:00" },
  });

  const createMutation = useMutation({
    mutationFn: (values: SchedulerFormValues) => {
      const asset = assets.find((item) => item.id === values.assetId);
      if (!asset) throw new Error("Asset not available.");
      return createScheduledPost({ campaignId: asset.campaignId, ...values });
    },
    onSuccess: () => { addToast("success", "Post scheduled"); void queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] }); },
    onError: () => { addToast("error", "Failed to schedule post"); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteScheduledPost,
    onSuccess: () => { addToast("success", "Scheduled post removed"); void queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] }); },
  });

  const filtered = posts.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (channelFilter !== "all" && p.channel !== channelFilter) return false;
    return true;
  });

  return (
    <section className="space-y-5">
      <SectionHeading eyebrow="Scheduler" title="Publishing queue" />
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        {/* Create form */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule a post</CardTitle>
            <CardDescription>Pick an asset, channel, date, and time to queue it for publishing.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={form.handleSubmit((v) => createMutation.mutate(v))}>
              <label className="block space-y-2 text-sm text-text-muted">
                Asset
                <select className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60" {...form.register("assetId")}>
                  {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.title}</option>)}
                </select>
              </label>
              <label className="block space-y-2 text-sm text-text-muted">
                Channel
                <select className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60" {...form.register("channel")}>
                  {channels.map((ch) => <option key={ch} value={ch}>{ch}</option>)}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-2 text-sm text-text-muted">Date<Input type="date" {...form.register("date")} /></label>
                <label className="block space-y-2 text-sm text-text-muted">Time<Input type="time" {...form.register("time")} /></label>
              </div>
              {form.formState.errors.assetId && <p className="text-sm text-error">{form.formState.errors.assetId.message}</p>}
              <Button className="w-full" type="submit" disabled={createMutation.isPending || assets.length === 0}>Schedule post</Button>
            </form>
          </CardContent>
        </Card>

        {/* Scheduled posts list */}
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Pill label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
            <Pill label="Draft" active={statusFilter === "draft"} onClick={() => setStatusFilter("draft")} />
            <Pill label="Scheduled" active={statusFilter === "scheduled"} onClick={() => setStatusFilter("scheduled")} />
            <Pill label="Published" active={statusFilter === "published"} onClick={() => setStatusFilter("published")} />
            <div className="mx-1 w-px bg-border" />
            <Pill label="All channels" active={channelFilter === "all"} onClick={() => setChannelFilter("all")} />
            {channels.map((ch) => <Pill key={ch} label={ch} active={channelFilter === ch} onClick={() => setChannelFilter(ch)} />)}
          </div>

          {filtered.length === 0 && <p className="text-sm text-text-muted">No scheduled posts match your filters.</p>}

          {filtered.map((post) => {
            const asset = assets.find((item) => item.id === post.assetId);
            return (
              <Card key={post.id}>
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                  {/* Asset thumbnail */}
                  <div className={cn("h-16 w-full shrink-0 rounded-control sm:w-16", asset?.preview ?? "bg-surface-elevated")} />
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                      <CalendarClock className="h-4 w-4 shrink-0 text-accent" />
                      <span className="truncate">{asset?.title ?? "Scheduled asset"}</span>
                    </h3>
                    <p className="mt-1 text-xs text-text-muted">
                      {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(post.publishAt))}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone={statusTone[post.status]}>{post.status}</Badge>
                      <Badge tone="primary">{post.channel}</Badge>
                      <button type="button" onClick={() => deleteMutation.mutate(post.id)} disabled={deleteMutation.isPending} aria-label="Delete" className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition hover:bg-error/15 hover:text-error">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${active ? "border-primary bg-primary/12 text-text-primary" : "bg-surface-muted text-text-muted hover:bg-surface-elevated"}`}>
      {label}
    </button>
  );
}
