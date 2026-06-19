"use client";

import { Copy, Flame, Loader2, Rocket, Share2, Sparkles, TrendingUp } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);

  function toggleNiche(niche: TrendNiche) {
    setNiches((prev) => (prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]));
  }

  async function handleDiscover() {
    setLoading(true);
    setError(null);
    try {
      const data = await discoverTrends({ platform: platform || undefined, niches });
      setResults(data);
      if (data.length === 0) {
        addToast("info", "No trends found for your filters. Try different combinations.");
      }
    } catch (err) {
      console.error("[Trend Discovery] Error:", err);
      setError("Failed to fetch trends. Please try again.");
      addToast("error", "Failed to fetch trends");
    } finally {
      setLoading(false);
    }
  }

  function handleUseAsBrief(trend: Trend) {
    pinTrend(trend);
    addToast("success", "Trend pinned — use quick actions in Workspace to generate content");
    router.push("/workspace?from=trends");
  }

  function handleCopyHashtags(trend: Trend) {
    const hashtags = trend.hashtags.join(" ");
    navigator.clipboard.writeText(hashtags);
    addToast("success", "Hashtags copied to clipboard");
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
            {loading ? "Discovering..." : "Discover Trends"}
          </Button>

          {error && (
            <p className="text-sm text-error">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-card border border-dashed border-border p-8 text-text-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Fetching trending content...</span>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-border p-8 text-center">
          <TrendingUp className="h-6 w-6 text-text-muted" />
          <p className="text-sm text-text-muted">
            {error 
              ? "Something went wrong. Please try again."
              : "Select filters and click \u201CDiscover Trends\u201D to see what\u2019s viral."
            }
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((trend) => {
            const config = levelConfig[trend.level];
            const Icon = config.icon;
            return (
              <Card key={trend.id} className="flex flex-col transition-all hover:shadow-lg">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Badge tone="primary">{trend.platform}</Badge>
                      <Badge tone="neutral">{trend.niche}</Badge>
                    </div>
                    <Badge tone={config.tone}><Icon className="mr-1 h-3 w-3" />{config.label}</Badge>
                  </div>
                  <h3 className="mb-3 flex-1 text-base font-semibold leading-6 text-text-primary">
                    {trend.title}
                  </h3>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {trend.hashtags.map((tag) => (
                      <span key={tag} className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleUseAsBrief(trend)}
                    >
                      <Share2 className="mr-1.5 h-3.5 w-3.5" />
                      Use as Brief
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyHashtags(trend)}
                      title="Copy hashtags"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
