"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, CheckCircle, Clock, Edit2, ImageIcon, Loader2, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { useAssetsQuery, useScheduledPostsQuery } from "@/hooks/use-workspace-data";
import { createScheduledPost, deleteScheduledPost, updateScheduledPost, updateScheduledPostStatus } from "@/services/scheduler.service";
import { useToastStore } from "@/stores/toast-store";
import type { Asset, CampaignChannel, ScheduledPost } from "@/types/domain";

const schedulerSchema = z.object({
  assetId: z.string().min(1, "Pilih asset terlebih dahulu."),
  channel: z.enum(["Instagram", "LinkedIn", "TikTok", "Email"]),
  date: z.string().min(1, "Pilih tanggal."),
  time: z.string().min(1, "Pilih waktu."),
});

type SchedulerFormValues = z.infer<typeof schedulerSchema>;

const editSchema = z.object({
  channel: z.enum(["Instagram", "LinkedIn", "TikTok", "Email"]),
  date: z.string().min(1, "Pilih tanggal."),
  time: z.string().min(1, "Pilih waktu."),
});

type EditFormValues = z.infer<typeof editSchema>;

const statusConfig: Record<ScheduledPost["status"], { tone: "neutral" | "accent" | "success"; label: string; color: string }> = {
  draft: { tone: "neutral", label: "Draft", color: "bg-gray-400" },
  scheduled: { tone: "accent", label: "Scheduled", color: "bg-blue-500" },
  published: { tone: "success", label: "Published", color: "bg-green-500" },
};

const channelColors: Record<CampaignChannel, string> = {
  Instagram: "bg-pink-500",
  LinkedIn: "bg-blue-600",
  TikTok: "bg-purple-500",
  Email: "bg-amber-500",
};

const channels: CampaignChannel[] = ["Instagram", "LinkedIn", "TikTok", "Email"];

function toLocalDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return { date: "", time: "" };
  const date = d.toLocaleDateString("en-CA"); // YYYY-MM-DD
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); // HH:MM
  return { date, time };
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function SchedulerView() {
  const queryClient = useQueryClient();
  const postsQuery = useScheduledPostsQuery();
  const assetsQuery = useAssetsQuery();
  const assets = assetsQuery.data ?? [];
  const posts = postsQuery.data ?? [];
  const addToast = useToastStore((s) => s.addToast);

  const [statusFilter, setStatusFilter] = useState<ScheduledPost["status"] | "all">("all");
  const [channelFilter, setChannelFilter] = useState<CampaignChannel | "all">("all");
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);

  const form = useForm<SchedulerFormValues>({
    resolver: zodResolver(schedulerSchema),
    defaultValues: {
      assetId: "",
      channel: "Instagram",
      date: new Date().toLocaleDateString("en-CA"),
      time: "09:00",
    },
  });

  const selectedAssetId = form.watch("assetId");
  const selectedAsset = useMemo(() => assets.find((a) => a.id === selectedAssetId), [assets, selectedAssetId]);

  const createMutation = useMutation({
    mutationFn: (values: SchedulerFormValues) => {
      const asset = assets.find((item) => item.id === values.assetId);
      if (!asset) throw new Error("Asset not available.");
      return createScheduledPost({
        campaignId: asset.campaignId,
        assetId: asset.id,
        channel: values.channel,
        date: values.date,
        time: values.time,
      });
    },
    onSuccess: () => {
      addToast("success", "Post scheduled successfully");
      void queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      form.reset({
        assetId: "",
        channel: "Instagram",
        date: new Date().toLocaleDateString("en-CA"),
        time: "09:00",
      });
    },
    onError: (err) => {
      addToast("error", err.message || "Failed to schedule post");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteScheduledPost,
    onSuccess: () => {
      addToast("success", "Scheduled post removed");
      void queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
    },
    onError: () => {
      addToast("error", "Failed to delete scheduled post");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ScheduledPost["status"] }) =>
      updateScheduledPostStatus(id, status),
    onSuccess: () => {
      addToast("success", "Status updated");
      void queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
    },
    onError: () => {
      addToast("error", "Failed to update status");
    },
  });

  const filtered = posts.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (channelFilter !== "all" && p.channel !== channelFilter) return false;
    return true;
  });

  // Group posts by local date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, ScheduledPost[]> = {};
    for (const post of filtered) {
      if (!post.publishAt) continue;
      const date = new Date(post.publishAt);
      if (isNaN(date.getTime())) continue;
      const dateKey = date.toLocaleDateString("en-CA");
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(post);
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // Loading state
  if (postsQuery.isLoading || assetsQuery.isLoading) {
    return (
      <section className="space-y-5">
        <SectionHeading eyebrow="Scheduler" title="Publishing queue" />
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm text-text-muted">Loading scheduled posts...</p>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (postsQuery.isError) {
    return (
      <section className="space-y-5">
        <SectionHeading eyebrow="Scheduler" title="Publishing queue" />
        <div className="rounded-card border border-error/30 bg-error/5 p-8 text-center">
          <CalendarClock className="mx-auto h-8 w-8 text-error" />
          <p className="mt-2 text-sm font-medium text-error">Failed to load scheduled posts</p>
          <p className="mt-1 text-xs text-text-muted">
            {(postsQuery.error as Error)?.message || "An error occurred while fetching data."}
          </p>
          <Button
            className="mt-4"
            variant="secondary"
            onClick={() => void queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] })}
          >
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <SectionHeading eyebrow="Scheduler" title="Publishing queue" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatCard label="Total Scheduled" value={posts.filter((p) => p.status === "scheduled").length} icon={CalendarClock} />
        <StatCard label="Drafts" value={posts.filter((p) => p.status === "draft").length} icon={Clock} />
        <StatCard label="Published" value={posts.filter((p) => p.status === "published").length} icon={CheckCircle} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        {/* Create form */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-accent" />
              Schedule a post
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="rounded-card border border-dashed border-border p-6 text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-text-muted" />
                <p className="mt-2 text-sm text-text-muted">
                  No saved assets yet. Generate and save assets first.
                </p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={form.handleSubmit((v) => createMutation.mutate(v))}>
                {/* Asset selector with preview */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted">Asset</label>
                  <select
                    className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
                    {...form.register("assetId")}
                  >
                    <option value="">Select an asset...</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.title} ({asset.channel})
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.assetId && (
                    <p className="text-xs text-error">{form.formState.errors.assetId.message}</p>
                  )}

                  {/* Asset preview */}
                  {selectedAsset && (
                    <div className="mt-3 overflow-hidden rounded-card border">
                      {selectedAsset.kind === "image" && selectedAsset.preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedAsset.preview}
                          alt={selectedAsset.title}
                          className="h-40 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-40 items-center justify-center bg-surface-muted">
                          <ImageIcon className="h-8 w-8 text-text-muted" />
                        </div>
                      )}
                      <div className="border-t p-3">
                        <p className="text-sm font-medium text-text-primary">{selectedAsset.title}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-text-muted">{selectedAsset.prompt}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Channel selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-muted">Channel</label>
                  <div className="grid grid-cols-2 gap-2">
                    {channels.map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => form.setValue("channel", ch)}
                        className={`flex items-center gap-2 rounded-control border px-3 py-2 text-sm font-medium transition ${
                          form.watch("channel") === ch
                            ? "border-accent bg-accent/10 text-text-primary"
                            : "border-border bg-surface-muted text-text-muted hover:bg-surface-elevated"
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${channelColors[ch]}`} />
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted">Date</label>
                    <input
                      type="date"
                      className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
                      {...form.register("date")}
                    />
                    {form.formState.errors.date && (
                      <p className="text-xs text-error">{form.formState.errors.date.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-muted">Time</label>
                    <input
                      type="time"
                      className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
                      {...form.register("time")}
                    />
                    {form.formState.errors.time && (
                      <p className="text-xs text-error">{form.formState.errors.time.message}</p>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full"
                  type="submit"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scheduling...
                    </span>
                  ) : (
                    "Schedule post"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Scheduled posts list */}
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            <FilterPill label="All" active={statusFilter === "all"} onClick={() => setStatusFilter("all")} />
            <FilterPill label="Draft" active={statusFilter === "draft"} onClick={() => setStatusFilter("draft")} />
            <FilterPill label="Scheduled" active={statusFilter === "scheduled"} onClick={() => setStatusFilter("scheduled")} />
            <FilterPill label="Published" active={statusFilter === "published"} onClick={() => setStatusFilter("published")} />
            <div className="shrink-0 mx-0.5 h-4 w-px bg-border self-center" />
            <FilterPill label="All channels" active={channelFilter === "all"} onClick={() => setChannelFilter("all")} />
            {channels.map((ch) => (
              <FilterPill key={ch} label={ch} active={channelFilter === ch} onClick={() => setChannelFilter(ch)} />
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="rounded-card border border-dashed border-border p-8 text-center">
              <CalendarClock className="mx-auto h-8 w-8 text-text-muted" />
              <p className="mt-2 text-sm text-text-muted">
                {posts.length === 0
                  ? "No scheduled posts yet. Create one to get started."
                  : "No posts match your filters."}
              </p>
            </div>
          )}

          {/* Grouped by date */}
          {groupedByDate.map(([dateKey, datePosts]) => (
            <div key={dateKey} className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
                <CalendarClock className="h-3.5 w-3.5" />
                {formatDate(dateKey + "T00:00:00")}
              </h3>
              <div className="space-y-2">
                {datePosts.map((post) => (
                  <ScheduleCard
                    key={post.id}
                    post={post}
                    asset={assets.find((a) => a.id === post.assetId)}
                    onDelete={() => deleteMutation.mutate(post.id)}
                    onEdit={() => setEditingPost(post)}
                    onStatusChange={(status) => statusMutation.mutate({ id: post.id, status })}
                    deleting={deleteMutation.isPending}
                    updatingStatus={statusMutation.isPending}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingPost && (
        <EditModal
          post={editingPost}
          assets={assets}
          onClose={() => setEditingPost(null)}
          onSuccess={() => {
            setEditingPost(null);
            void queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
          }}
        />
      )}
    </section>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof CalendarClock }) {
  return (
    <Card className="p-3 sm:p-4">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent" />
        <span className="text-[10px] sm:text-xs font-medium text-text-muted leading-tight">{label}</span>
      </div>
      <p className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-semibold text-text-primary">{value}</p>
    </Card>
  );
}

function ScheduleCard({
  post,
  asset,
  onDelete,
  onEdit,
  onStatusChange,
  deleting,
  updatingStatus,
}: {
  post: ScheduledPost;
  asset: Asset | undefined;
  onDelete: () => void;
  onEdit: () => void;
  onStatusChange: (status: ScheduledPost["status"]) => void;
  deleting: boolean;
  updatingStatus: boolean;
}) {
  const status = statusConfig[post.status];
  const publishDate = new Date(post.publishAt);
  const isValidDate = !isNaN(publishDate.getTime());
  const time = isValidDate
    ? publishDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : "--:--";

  // Determine next status for quick action
  const nextStatus: Record<ScheduledPost["status"], ScheduledPost["status"]> = {
    draft: "scheduled",
    scheduled: "published",
    published: "published",
  };
  const nextStatusLabel: Record<ScheduledPost["status"], string> = {
    draft: "Schedule",
    scheduled: "Publish",
    published: "Published",
  };

  return (
    <Card className="group transition hover:border-accent/30">
      <div className="flex items-start gap-3 p-3 sm:items-center">
        {/* Thumbnail */}
        <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-control bg-surface-muted">
          {asset?.kind === "image" && asset.preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={asset.preview} alt={asset.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-5 w-5 text-text-muted" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="truncate text-sm font-medium text-text-primary">
            {asset?.title ?? "Unknown asset"}
          </p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Clock className="h-3 w-3" />
              {time}
            </span>
            <span className={`h-2 w-2 rounded-full ${channelColors[post.channel]}`} />
            <span className="text-xs text-text-muted">{post.channel}</span>
            <Badge tone={status.tone} className="ml-auto shrink-0 sm:hidden">{status.label}</Badge>
          </div>
        </div>

        {/* Status + actions - desktop */}
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <Badge tone={status.tone}>{status.label}</Badge>
          {post.status !== "published" && (
            <button
              type="button"
              onClick={() => onStatusChange(nextStatus[post.status])}
              disabled={updatingStatus}
              className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition hover:bg-success/15 hover:text-success disabled:opacity-50"
              aria-label={nextStatusLabel[post.status]}
              title={nextStatusLabel[post.status]}
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition hover:bg-accent/15 hover:text-accent"
            aria-label="Edit scheduled post"
            title="Edit"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition hover:bg-error/15 hover:text-error disabled:opacity-50"
            aria-label="Delete scheduled post"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Actions - mobile bottom row */}
      <div className="flex sm:hidden items-center justify-end gap-1 border-t px-3 py-2">
        {post.status !== "published" && (
          <button
            type="button"
            onClick={() => onStatusChange(nextStatus[post.status])}
            disabled={updatingStatus}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition active:bg-success/15 active:text-success disabled:opacity-50"
            aria-label={nextStatusLabel[post.status]}
          >
            <CheckCircle className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition active:bg-accent/15 active:text-accent"
          aria-label="Edit"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition active:bg-error/15 active:text-error disabled:opacity-50"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

function EditModal({
  post,
  assets,
  onClose,
  onSuccess,
}: {
  post: ScheduledPost;
  assets: Asset[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const asset = assets.find((a) => a.id === post.assetId);
  const initial = toLocalDateTime(post.publishAt);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      channel: post.channel,
      date: initial.date,
      time: initial.time,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (values: EditFormValues) =>
      updateScheduledPost(post.id, {
        channel: values.channel,
        date: values.date,
        time: values.time,
      }),
    onSuccess: () => {
      addToast("success", "Scheduled post updated");
      void queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      onSuccess();
    },
    onError: (err) => {
      addToast("error", err.message || "Failed to update scheduled post");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <Edit2 className="h-4 w-4 text-accent" />
            Edit scheduled post
          </CardTitle>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition hover:bg-surface-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent>
          {/* Asset info (read-only) */}
          {asset && (
            <div className="mb-4 flex items-center gap-3 rounded-control border bg-surface-muted p-3">
              {asset.kind === "image" && asset.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset.preview} alt={asset.title} className="h-10 w-10 rounded-control object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-control bg-surface-elevated">
                  <ImageIcon className="h-4 w-4 text-text-muted" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text-primary">{asset.title}</p>
                <p className="text-xs text-text-muted">{asset.channel}</p>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={form.handleSubmit((v) => updateMutation.mutate(v))}>
            {/* Channel selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-muted">Channel</label>
              <div className="grid grid-cols-2 gap-2">
                {channels.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => form.setValue("channel", ch)}
                    className={`flex items-center gap-2 rounded-control border px-3 py-2 text-sm font-medium transition ${
                      form.watch("channel") === ch
                        ? "border-accent bg-accent/10 text-text-primary"
                        : "border-border bg-surface-muted text-text-muted hover:bg-surface-elevated"
                    }`}
                  >
                    <span className={`h-2.5 w-2.5 rounded-full ${channelColors[ch]}`} />
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Date</label>
                <input
                  type="date"
                  className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
                  {...form.register("date")}
                />
                {form.formState.errors.date && (
                  <p className="text-xs text-error">{form.formState.errors.date.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Time</label>
                <input
                  type="time"
                  className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
                  {...form.register("time")}
                />
                {form.formState.errors.time && (
                  <p className="text-xs text-error">{form.formState.errors.time.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant="secondary"
                type="button"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-accent bg-accent/10 text-text-primary"
          : "border-border bg-surface-muted text-text-muted hover:bg-surface-elevated"
      }`}
    >
      {label}
    </button>
  );
}
