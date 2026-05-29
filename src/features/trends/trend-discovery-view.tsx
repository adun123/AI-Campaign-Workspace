"use client";

import { Flame, Rocket, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { trendNiches, trendPlatforms, type Trend, type TrendLevel, type TrendNiche, type TrendPlatform } from "@/lib/trend-data";
import { discoverTrends } from "@/services/trend.service";
import { useTrendBriefStore } from "@/stores/trend-brief-store";
import { useToastStore } from "@/stores/toast-store";

const levelConfig: Record<TrendLevel, { icon: typeof Flame; label: string; tone: "error" | "warning" | "accent" }> = {
  high: { icon: Flame, label: "High", tone: "error" },
  rising: { icon: TrendingUp, label: "Rising", tone: "warning" },
  emerging: { icon: Sparkles, label: "Emerging", tone: "accent" },
};

export function TrendDiscoveryView() {
  const router = useRouter();
  const pinTrend = useTrendBriefStore((s) => s.pinTrend);
  const addToast = useToastStore((s) => s.addToast);

  const [platform, setPlatform] = useState<TrendPlatform | "">("");
  const [niches, setNiches] = useState<TrendNiche[]>([]);
  const [results, setResults] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(false);

  function toggleNiche(niche: TrendNiche) {
    setNiches((prev) => (prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]));
  }

  async function handleDiscover() {
    setLoading(true);
    const data = await discoverTrends({ platform: platform || undefined, niches });
    setResults(data);
    setLoading(false);
  }

  function handleUseAsBrief(trend: Trend) {
    pinTrend(trend);
    addToast("success", "Trend pinned as brief — go to Workspace");
    router.push("/workspace");
  }

  return (
    <section className="space-y-5">
      <SectionHeading eyebrow="Trend Discovery" title="Find what's viral right now" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Rocket className="h-4 w-4 text-accent" /> Filter trends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-text-muted">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as TrendPlatform | "")}
              className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
            >
              <option value="">All platforms</option>
              {trendPlatforms.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-muted">Niche (multi-select)</label>
            <div className="flex flex-wrap gap-2">
              {trendNiches.map((niche) => (
                <button
                  key={niche}
                  type="button"
                  onClick={() => toggleNiche(niche)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${niches.includes(niche) ? "border-primary bg-primary/12 text-text-primary" : "bg-surface-muted text-text-muted hover:bg-surface-elevated"}`}
                >
                  {niche}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleDiscover} disabled={loading}>
            <TrendingUp className="h-4 w-4" /> {loading ? "Discovering..." : "Discover Trends"}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((trend) => {
            const config = levelConfig[trend.level];
            const Icon = config.icon;
            return (
              <Card key={trend.id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <Badge tone="primary">{trend.platform}</Badge>
                    <Badge tone={config.tone}><Icon className="mr-1 h-3 w-3" />{config.label}</Badge>
                  </div>
                  <h3 className="mt-3 flex-1 text-sm font-semibold leading-6 text-text-primary">{trend.title}</h3>
                  <Badge tone="neutral" className="mt-2 w-fit">{trend.niche}</Badge>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {trend.hashtags.map((tag) => (
                      <span key={tag} className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">{tag}</span>
                    ))}
                  </div>
                  <Button className="mt-4 w-full" variant="secondary" size="sm" onClick={() => handleUseAsBrief(trend)}>
                    Use as Brief
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {results.length === 0 && !loading && (
        <p className="text-sm text-text-muted">Select filters and click &quot;Discover Trends&quot; to see what&apos;s viral.</p>
      )}
    </section>
  );
}
