"use client";

import { Copy, Flame, Loader2, Rocket, Share2, Sparkles, TrendingUp, X, FolderOpen } from "lucide-react";
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
import { useCampaignsQuery } from "@/hooks/use-workspace-data";
import type { Campaign } from "@/types/domain";

const levelConfig: Record<TrendLevel, { icon: typeof Flame; label: string; tone: "error" | "warning" | "accent" }> = {
  high: { icon: Flame, label: "High", tone: "error" },
  rising: { icon: TrendingUp, label: "Rising", tone: "warning" },
  emerging: { icon: Sparkles, label: "Emerging", tone: "accent" },
};

export function TrendDiscoveryView() {
  const router = useRouter();
  const pinTrend = useTrendBriefStore((s) => s.pinTrend);
  const setTargetCampaign = useTrendBriefStore((s) => s.setTargetCampaign);
  const addToast = useToastStore((s) => s.addToast);
  const campaignsQuery = useCampaignsQuery();

  const [platform, setPlatform] = useState<TrendPlatform | "">("");
  const [niches, setNiches] = useState<TrendNiche[]>([]);
  const [country, setCountry] = useState<string>("ID");
  const [period, setPeriod] = useState<7 | 30 | 120>(7);
  const [results, setResults] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [pendingTrend, setPendingTrend] = useState<Trend | null>(null);

  function toggleNiche(niche: TrendNiche) {
    setNiches((prev) => (prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]));
  }

  async function handleDiscover() {
    setLoading(true);
    setError(null);
    try {
      const data = await discoverTrends({ 
        platform: platform || undefined, 
        niches,
        country,
        period,
      });
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
    const campaigns = campaignsQuery.data ?? [];
    
    // Case 1: No campaigns — redirect to create one
    if (campaigns.length === 0) {
      pinTrend(trend);
      addToast("info", "Create a campaign first to use this trend as brief");
      router.push("/campaigns");
      return;
    }
    
    // Case 2: Exactly 1 campaign — use it directly
    if (campaigns.length === 1) {
      pinTrend(trend);
      setTargetCampaign(campaigns[0].id);
      addToast("success", `Trend applied to "${campaigns[0].name}"`);
      router.push("/workspace");
      return;
    }
    
    // Case 3: Multiple campaigns — show selector
    setPendingTrend(trend);
    setSelectorOpen(true);
  }

  function handleSelectCampaign(campaign: Campaign) {
    if (!pendingTrend) return;
    pinTrend(pendingTrend);
    setTargetCampaign(campaign.id);
    addToast("success", `Trend applied to "${campaign.name}"`);
    setSelectorOpen(false);
    setPendingTrend(null);
    router.push("/workspace");
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
            <label className="text-sm text-text-muted">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
            >
              <option value="ID">Indonesia</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="SG">Singapore</option>
              <option value="MY">Malaysia</option>
              <option value="TH">Thailand</option>
              <option value="PH">Philippines</option>
              <option value="VN">Vietnam</option>
              <option value="JP">Japan</option>
              <option value="KR">South Korea</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-text-muted">Time Period</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPeriod(7)}
                className={`flex-1 rounded-control border px-3 py-2 text-sm font-medium transition ${
                  period === 7
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border bg-surface-muted text-text-muted hover:bg-surface-elevated"
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setPeriod(30)}
                className={`flex-1 rounded-control border px-3 py-2 text-sm font-medium transition ${
                  period === 30
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border bg-surface-muted text-text-muted hover:bg-surface-elevated"
                }`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => setPeriod(120)}
                className={`flex-1 rounded-control border px-3 py-2 text-sm font-medium transition ${
                  period === 120
                    ? "border-accent bg-accent/10 text-text-primary"
                    : "border-border bg-surface-muted text-text-muted hover:bg-surface-elevated"
                }`}
              >
                120 Days
              </button>
            </div>
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
            const isRealtime = (trend as any).source === "realtime";
            return (
              <Card key={trend.id} className="flex flex-col transition-all hover:shadow-lg">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone="primary">{trend.platform}</Badge>
                      <Badge tone="neutral">{trend.niche}</Badge>
                      {isRealtime && (
                        <Badge tone="accent">🔴 Live</Badge>
                      )}
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

      {/* Campaign Selector Modal */}
      {selectorOpen && pendingTrend && (
        <CampaignSelectorModal
          trend={pendingTrend}
          campaigns={campaignsQuery.data ?? []}
          onSelect={handleSelectCampaign}
          onClose={() => {
            setSelectorOpen(false);
            setPendingTrend(null);
          }}
        />
      )}
    </section>
  );
}

function CampaignSelectorModal({
  trend,
  campaigns,
  onSelect,
  onClose,
}: {
  trend: Trend;
  campaigns: Campaign[];
  onSelect: (campaign: Campaign) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Select Campaign</h3>
              <p className="text-sm text-text-muted mt-1">
                Which campaign should this trend be applied to?
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 p-3 rounded-lg bg-surface-muted border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Badge tone={trend.level === "high" ? "error" : trend.level === "rising" ? "warning" : "success"}>
                {trend.level}
              </Badge>
              <Badge tone="neutral">{trend.platform}</Badge>
            </div>
            <p className="text-sm font-medium text-text-primary">{trend.title}</p>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {campaigns.map((campaign) => (
              <button
                key={campaign.id}
                onClick={() => onSelect(campaign)}
                className="w-full p-3 rounded-lg border border-border hover:border-accent hover:bg-accent/5 transition-colors text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-surface-muted group-hover:bg-accent/10 transition-colors">
                    <FolderOpen className="h-5 w-5 text-text-muted group-hover:text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary">{campaign.name}</p>
                    {campaign.objective && (
                      <p className="text-sm text-text-muted truncate mt-0.5">
                        {campaign.objective}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
