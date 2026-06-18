"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, DollarSign, FolderOpen, ImageIcon, Layers, Send, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { useDashboardSummaryQuery } from "@/hooks/use-workspace-data";
import { useChatStore } from "@/stores/chat-store";

const CHANNEL_COLORS: Record<string, string> = {
  Instagram: "bg-pink-500",
  LinkedIn: "bg-blue-600",
  TikTok: "bg-purple-500",
  Email: "bg-amber-500",
  Facebook: "bg-blue-500",
  "YouTube Shorts": "bg-red-500",
  X: "bg-gray-400",
};

const STATUS_STYLES: Record<string, { tone: "accent" | "error" | "neutral"; label: string }> = {
  completed: { tone: "accent", label: "Done" },
  error: { tone: "error", label: "Failed" },
  processing: { tone: "neutral", label: "Running" },
  queued: { tone: "neutral", label: "Queued" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function DashboardView() {
  const summaryQuery = useDashboardSummaryQuery();
  const data = summaryQuery.data;

  if (summaryQuery.isLoading) {
    return (
      <section className="space-y-4">
        <SectionHeading eyebrow="Dashboard" title="Campaign overview" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-20 animate-pulse bg-surface-muted" />
          ))}
        </div>
      </section>
    );
  }

  const metrics = data?.metrics ?? [
    { label: "Assets", value: "0" },
    { label: "Generations", value: "0" },
    { label: "Scheduled", value: "0" },
    { label: "Campaigns", value: "0" },
  ];
  const readiness = data?.readiness ?? 0;
  const estimatedCost = data?.estimatedCost ?? "0.000";
  const channelBreakdown = data?.channelBreakdown ?? {};
  const recentAssets = data?.recentAssets ?? [];
  const recentGenerations = data?.recentGenerations ?? [];

  const metricIcons: Record<string, typeof Layers> = {
    Assets: Layers,
    Generations: Sparkles,
    Scheduled: Send,
    Campaigns: FolderOpen,
  };

  const totalChannelAssets = Object.values(channelBreakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <section className="space-y-5">
      <SectionHeading
        eyebrow="Dashboard"
        title="Campaign overview"
        actions={
          <Button size="sm" asChild>
            <Link href="/workspace"><Sparkles className="h-4 w-4" /> Workspace</Link>
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = metricIcons[m.label] ?? BarChart3;
          return (
            <Card key={m.label} className="p-4">
              <Icon className="h-4 w-4 text-accent" />
              <p className="mt-2 text-2xl font-semibold text-text-primary">{m.value}</p>
              <p className="text-xs text-text-muted">{m.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Trends CTA + Cost */}
      <div className="grid gap-4 lg:grid-cols-3">
        <TrendsCTA />
        <div className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <DollarSign className="h-4 w-4 text-accent" />
              <p className="mt-2 text-2xl font-semibold text-text-primary">${estimatedCost}</p>
              <p className="text-xs text-text-muted">Estimated cost</p>
            </Card>
            <Card className="p-4">
              <TrendingUp className="h-4 w-4 text-accent" />
              <p className="mt-2 text-2xl font-semibold text-text-primary">{readiness}%</p>
              <p className="text-xs text-text-muted">Campaign ready</p>
            </Card>
          </div>

          {/* Channel breakdown */}
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-medium text-text-primary">Channel distribution</h3>
            {totalChannelAssets <= 1 && Object.keys(channelBreakdown).length === 0 ? (
              <p className="text-xs text-text-muted">No assets yet. Generate in Workspace to see breakdown.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(channelBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([channel, count]) => {
                    const pct = Math.round((count / totalChannelAssets) * 100);
                    const color = CHANNEL_COLORS[channel] ?? "bg-gray-500";
                    return (
                      <div key={channel} className="flex items-center gap-3">
                        <span className="w-20 shrink-0 text-xs font-medium text-text-primary">{channel}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                          <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right text-xs text-text-muted">{count}</span>
                      </div>
                    );
                  })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Quick generate */}
      <QuickGenerate />

      {/* Recent assets + Recent generations */}
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentAssets assets={recentAssets} />
        <RecentGenerations generations={recentGenerations} />
      </div>
    </section>
  );
}

function TrendsCTA() {
  return (
    <Link href="/trends" className="block h-full">
      <Card className="group relative h-full overflow-hidden border-accent/30 transition-all hover:border-accent/60 hover:shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent" />
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/10 blur-2xl transition-all group-hover:bg-accent/20" />
        <CardContent className="relative flex h-full flex-col p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
            <TrendingUp className="h-5 w-5 text-accent" />
          </div>
          <h3 className="mb-1.5 text-base font-semibold text-text-primary">Discover Trends</h3>
          <p className="mb-4 flex-1 text-sm leading-relaxed text-text-muted">
            Find what's viral right now across TikTok, Instagram, and LinkedIn. Generate content that rides the wave.
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-accent transition-colors group-hover:text-accent/80">
            Explore trends <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickGenerate() {
  const router = useRouter();
  const addMessage = useChatStore((s) => s.addMessage);
  const [prompt, setPrompt] = useState("");

  function handleGo() {
    if (!prompt.trim()) return;
    addMessage({ role: "user", content: prompt.trim() });
    addMessage({ role: "ai", content: "Generating..." });
    setPrompt("");
    router.push("/workspace");
  }

  return (
    <Card className="p-3">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-accent" />
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleGo(); }}
          placeholder="Quick generate — type a prompt and go to workspace..."
          className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted/70"
        />
        <Button size="sm" onClick={handleGo} disabled={!prompt.trim()}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function RecentAssets({ assets }: { assets: { id: string; title: string; kind: string; channel: string; preview: string; created_at: string }[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Recent Assets</CardTitle>
          {assets.length > 0 && (
            <Link href="/assets" className="text-xs text-accent hover:underline">View all &rarr;</Link>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {assets.length === 0 ? (
          <p className="text-xs text-text-muted">No assets yet. Start generating in the Workspace.</p>
        ) : (
          assets.map((asset) => {
            const isImage = asset.kind === "image" && (asset.preview?.startsWith("http") || asset.preview?.startsWith("data:"));
            return (
              <div key={asset.id} className="flex items-center gap-3 rounded-control border bg-surface-muted px-3 py-2">
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.preview} alt="" className="h-8 w-8 shrink-0 rounded bg-surface-elevated object-cover" />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-elevated">
                    <ImageIcon className="h-3.5 w-3.5 text-text-muted" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-text-primary">{asset.title}</p>
                  <p className="text-xs text-text-muted">{timeAgo(asset.created_at)}</p>
                </div>
                <Badge tone="primary">{asset.channel}</Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

function RecentGenerations({ generations }: { generations: { id: string; mode: string; prompt: string; status: string; created_at: string }[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Recent Generations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {generations.length === 0 ? (
          <p className="text-xs text-text-muted">No generations yet. Your AI activity will appear here.</p>
        ) : (
          generations.map((gen) => {
            const statusStyle = STATUS_STYLES[gen.status] ?? { tone: "neutral" as const, label: gen.status };
            return (
              <div key={gen.id} className="flex items-center gap-3 rounded-control border bg-surface-muted px-3 py-2">
                <Badge tone={gen.mode === "text-to-image" ? "primary" : "accent"}>
                  {gen.mode === "text-to-image" ? "Text" : "Image"}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-medium text-text-primary">{gen.prompt}</p>
                  <p className="text-xs text-text-muted">{timeAgo(gen.created_at)}</p>
                </div>
                <Badge tone={statusStyle.tone}>{statusStyle.label}</Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
