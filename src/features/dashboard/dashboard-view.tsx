"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarClock, ImageIcon, Layers, Send, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { useActiveCampaignQuery, useAssetsQuery, useScheduledPostsQuery } from "@/hooks/use-workspace-data";
import { useChatStore } from "@/stores/chat-store";

export function DashboardView() {
  const campaignQuery = useActiveCampaignQuery();
  const assetsQuery = useAssetsQuery(campaignQuery.data?.id);
  const postsQuery = useScheduledPostsQuery();
  const campaign = campaignQuery.data;
  const assets = assetsQuery.data ?? [];
  const posts = postsQuery.data ?? [];

  const assetCount = assets.length;
  const scheduledCount = posts.length;
  const readiness = Math.min(100, Math.min(assetCount, 5) * 12 + Math.min(scheduledCount, 3) * 10 + 6);

  return (
    <section className="space-y-4">
      <SectionHeading eyebrow="Dashboard" title="Campaign overview" actions={<Button size="sm" asChild><Link href="/workspace"><Sparkles className="h-4 w-4" /> Workspace</Link></Button>} />

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-3">
        <MetricCard icon={Layers} value={String(assetCount)} label="Assets" />
        <MetricCard icon={Send} value={String(scheduledCount)} label="Scheduled" />
        <MetricCard icon={TrendingUp} value={`${readiness}%`} label="Ready" />
      </div>

      {/* Progress bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-text-primary">{campaign?.name ?? "Campaign"}</span>
          <span className="text-text-muted">{readiness}% ready</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${readiness}%` }} />
        </div>
      </Card>

      {/* Quick generate */}
      <QuickGenerate />

      {/* Two columns: upcoming + activity (stacks on mobile) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <UpcomingPosts posts={posts} assets={assets} />
        <RecentActivity assetCount={assetCount} scheduledCount={scheduledCount} />
      </div>
    </section>
  );
}

function MetricCard({ icon: Icon, value, label }: { icon: typeof Layers; value: string; label: string }) {
  return (
    <Card className="p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-accent" />
      <p className="mt-1.5 text-lg font-semibold text-text-primary">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </Card>
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
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleGo(); }} placeholder="Quick generate — type a prompt..." className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted/70" />
        <Button size="sm" onClick={handleGo} disabled={!prompt.trim()}><ArrowRight className="h-4 w-4" /></Button>
      </div>
    </Card>
  );
}

function UpcomingPosts({ posts, assets }: { posts: { id: string; assetId: string; channel: string; publishAt: string }[]; assets: { id: string; title: string }[] }) {
  const upcoming = posts.slice(0, 3);

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">Upcoming Posts</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {upcoming.length === 0 && <p className="text-xs text-text-muted">No scheduled posts yet.</p>}
        {upcoming.map((post) => {
          const asset = assets.find((a) => a.id === post.assetId);
          return (
            <div key={post.id} className="flex items-center gap-3 rounded-control border bg-surface-muted px-3 py-2">
              <CalendarClock className="h-4 w-4 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-text-primary">{asset?.title ?? "Post"}</p>
                <p className="text-xs text-text-muted">{post.publishAt ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(post.publishAt)) : "Not scheduled"}</p>
              </div>
              <Badge tone="primary">{post.channel}</Badge>
            </div>
          );
        })}
        {posts.length > 3 && <Link href="/scheduler" className="block text-xs text-accent hover:underline">View all →</Link>}
      </CardContent>
    </Card>
  );
}

function RecentActivity({ assetCount, scheduledCount }: { assetCount: number; scheduledCount: number }) {
  const activities = [
    assetCount > 0 && { text: `${assetCount} asset(s) in library`, icon: ImageIcon, time: "Recently" },
    scheduledCount > 0 && { text: `${scheduledCount} post(s) scheduled`, icon: Send, time: "Recently" },
    { text: "Campaign workspace active", icon: Sparkles, time: "Now" },
  ].filter(Boolean) as { text: string; icon: typeof ImageIcon; time: string }[];

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {activities.map((a, i) => (
          <div key={i} className="flex items-center gap-3 rounded-control border bg-surface-muted px-3 py-2">
            <a.icon className="h-4 w-4 shrink-0 text-accent" />
            <span className="flex-1 text-xs text-text-primary">{a.text}</span>
            <span className="text-xs text-text-muted">{a.time}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
