"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Download, Grid3X3, ImageIcon, List, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { useAssetsQuery } from "@/hooks/use-workspace-data";
import { deleteAsset } from "@/services/asset.service";
import { scheduleAsset } from "@/services/scheduler.service";
import { useToastStore } from "@/stores/toast-store";
import type { Asset, AssetKind, CampaignChannel } from "@/types/domain";
import { cn } from "@/lib/utils";

const kindFilters: AssetKind[] = ["image", "carousel", "caption"];
const channelFilters: CampaignChannel[] = ["Instagram", "LinkedIn", "TikTok", "Email"];

export function AssetLibrary() {
  const queryClient = useQueryClient();
  const assetsQuery = useAssetsQuery();
  const assets = assetsQuery.data ?? [];
  const addToast = useToastStore((s) => s.addToast);

  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<AssetKind | "all">("all");
  const [channelFilter, setChannelFilter] = useState<CampaignChannel | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const deleteMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => { addToast("success", "Asset deleted"); void queryClient.invalidateQueries({ queryKey: ["assets"] }); },
  });

  const scheduleMutation = useMutation({
    mutationFn: scheduleAsset,
    onSuccess: () => { addToast("success", "Post scheduled"); void queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] }); },
  });

  const filtered = assets.filter((a) => {
    if (kindFilter !== "all" && a.kind !== kindFilter) return false;
    if (channelFilter !== "all" && a.channel !== channelFilter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.prompt.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="space-y-5">
      <SectionHeading eyebrow="Asset Library" title="Saved campaign assets" />

      {/* Search + View toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or prompt..." className="h-10 w-full rounded-control border bg-surface-muted pl-9 pr-3 text-sm text-text-primary outline-none focus:border-accent/60" />
        </div>
        <button type="button" onClick={() => setView("grid")} className={cn("rounded-control p-2 transition", view === "grid" ? "bg-primary/12 text-text-primary" : "text-text-muted hover:text-text-primary")} aria-label="Grid view"><Grid3X3 className="h-4 w-4" /></button>
        <button type="button" onClick={() => setView("list")} className={cn("rounded-control p-2 transition", view === "list" ? "bg-primary/12 text-text-primary" : "text-text-muted hover:text-text-primary")} aria-label="List view"><List className="h-4 w-4" /></button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <FilterPill label="All types" active={kindFilter === "all"} onClick={() => setKindFilter("all")} />
        {kindFilters.map((k) => <FilterPill key={k} label={k} active={kindFilter === k} onClick={() => setKindFilter(k)} />)}
        <div className="mx-2 w-px bg-border" />
        <FilterPill label="All channels" active={channelFilter === "all"} onClick={() => setChannelFilter("all")} />
        {channelFilters.map((c) => <FilterPill key={c} label={c} active={channelFilter === c} onClick={() => setChannelFilter(c)} />)}
      </div>

      {/* Assets */}
      {filtered.length === 0 ? (
        <EmptyState title="No assets found" description={assets.length === 0 ? "Generate from the Campaign Workspace, then save the strongest directions here." : "Try adjusting your filters or search."} />
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((asset) => (
            <GridAssetCard key={asset.id} asset={asset} onDelete={() => deleteMutation.mutate(asset.id)} onSchedule={() => scheduleMutation.mutate(asset)} onDownload={() => addToast("success", "Downloaded")} busy={deleteMutation.isPending || scheduleMutation.isPending} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((asset) => (
            <ListAssetRow key={asset.id} asset={asset} onDelete={() => deleteMutation.mutate(asset.id)} onSchedule={() => scheduleMutation.mutate(asset)} onDownload={() => addToast("success", "Downloaded")} busy={deleteMutation.isPending || scheduleMutation.isPending} />
          ))}
        </div>
      )}

      {assetsQuery.isLoading && <p className="flex items-center gap-2 text-sm text-text-muted"><ImageIcon className="h-4 w-4" /> Loading assets...</p>}
    </section>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${active ? "border-primary bg-primary/12 text-text-primary" : "bg-surface-muted text-text-muted hover:bg-surface-elevated"}`}>
      {label}
    </button>
  );
}

type AssetActions = { asset: Asset; onDelete: () => void; onSchedule: () => void; onDownload: () => void; busy: boolean };

function GridAssetCard({ asset, onDelete, onSchedule, onDownload, busy }: AssetActions) {
  return (
    <Card className="group relative overflow-hidden">
      <div className={cn("h-40 w-full", asset.preview)} />
      <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/40" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-3 opacity-0 transition group-hover:opacity-100">
        <IconBtn label="Download" onClick={onDownload} disabled={busy}><Download className="h-4 w-4" /></IconBtn>
        <IconBtn label="Schedule" onClick={onSchedule} disabled={busy}><CalendarPlus className="h-4 w-4" /></IconBtn>
        <IconBtn label="Delete" onClick={onDelete} disabled={busy}><Trash2 className="h-4 w-4" /></IconBtn>
      </div>
      <Badge className="absolute left-3 top-3" tone="primary">{asset.channel}</Badge>
      <div className="p-3">
        <p className="text-sm font-medium text-text-primary">{asset.title}</p>
        <p className="mt-1 line-clamp-1 text-xs text-text-muted">{asset.prompt}</p>
        <div className="mt-2 flex gap-2">
          <Badge tone="neutral">{asset.kind}</Badge>
          <Badge tone={asset.status === "saved" ? "success" : asset.status === "scheduled" ? "accent" : "neutral"}>{asset.status}</Badge>
        </div>
      </div>
    </Card>
  );
}

function ListAssetRow({ asset, onDelete, onSchedule, onDownload, busy }: AssetActions) {
  return (
    <div className="flex flex-col gap-3 rounded-card border bg-surface/88 p-3 transition hover:bg-surface-elevated sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <div className={cn("h-14 w-14 shrink-0 rounded-control", asset.preview)} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary">{asset.title}</p>
          <p className="line-clamp-1 text-xs text-text-muted">{asset.prompt}</p>
          <div className="mt-1.5 flex gap-2 sm:hidden">
            <Badge tone="neutral">{asset.kind}</Badge>
            <Badge tone="primary">{asset.channel}</Badge>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:ml-auto">
        <div className="hidden gap-2 sm:flex">
          <Badge tone="neutral">{asset.kind}</Badge>
          <Badge tone="primary">{asset.channel}</Badge>
        </div>
        <div className="flex shrink-0 gap-1">
          <IconBtn label="Download" onClick={onDownload} disabled={busy}><Download className="h-3.5 w-3.5" /></IconBtn>
          <IconBtn label="Schedule" onClick={onSchedule} disabled={busy}><CalendarPlus className="h-3.5 w-3.5" /></IconBtn>
          <IconBtn label="Delete" onClick={onDelete} disabled={busy}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 disabled:opacity-50">
      {children}
    </button>
  );
}
