"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { useCampaignsQuery } from "@/hooks/use-workspace-data";
import { createCampaign, updateCampaign, deleteCampaign } from "@/services/campaign.service";
import { useToastStore } from "@/stores/toast-store";
import type { Campaign, CampaignChannel } from "@/types/domain";

const allChannels: CampaignChannel[] = ["Instagram", "LinkedIn", "TikTok", "Email"];

export default function CampaignsPage() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const campaignsQuery = useCampaignsQuery();
  const campaigns = campaignsQuery.data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const deleteMutation = useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      addToast("success", "Campaign deleted");
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      void queryClient.invalidateQueries({ queryKey: ["active-campaign"] });
    },
    onError: () => addToast("error", "Failed to delete campaign"),
  });

  function handleEdit(campaign: Campaign) {
    setEditingCampaign(campaign);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (confirm("Delete this campaign? This will also delete all assets and generations.")) {
      deleteMutation.mutate(id);
    }
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingCampaign(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Campaigns</h1>
          <p className="mt-1 text-sm text-text-muted">Manage your marketing campaigns</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {campaignsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-text-muted">No campaigns yet</p>
          <Button onClick={() => setShowForm(true)} variant="secondary" className="mt-4" size="sm">
            Create your first campaign
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onEdit={() => handleEdit(campaign)}
              onDelete={() => handleDelete(campaign.id)}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      )}

      {showForm && (
        <CampaignFormDialog
          campaign={editingCampaign}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

function CampaignCard({
  campaign,
  onEdit,
  onDelete,
  isDeleting,
}: {
  campaign: Campaign;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const router = useRouter();
  const statusColors = {
    draft: "bg-text-muted/20 text-text-muted",
    active: "bg-success/20 text-success",
    scheduled: "bg-accent/20 text-accent",
  };

  return (
    <Card className="group relative cursor-pointer p-4 transition hover:border-accent/30" onClick={() => router.push(`/campaigns/${campaign.id}`)}>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-text-primary">{campaign.name}</h3>
          {campaign.objective && (
            <p className="mt-1 line-clamp-2 text-xs text-text-muted">{campaign.objective}</p>
          )}
        </div>
        <Badge className={statusColors[campaign.status]}>{campaign.status}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {campaign.channels.map((ch) => (
          <span key={ch} className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted">
            {ch}
          </span>
        ))}
      </div>

      {campaign.launchDate && (
        <p className="mt-2 text-xs text-text-muted">
          Launch: {new Date(campaign.launchDate).toLocaleDateString()}
        </p>
      )}

      <div className="mt-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="rounded-control p-1.5 text-text-muted transition hover:bg-surface-elevated hover:text-text-primary"
          aria-label="Edit"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          disabled={isDeleting}
          className="rounded-control p-1.5 text-text-muted transition hover:bg-error/20 hover:text-error"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </Card>
  );
}

function CampaignFormDialog({
  campaign,
  onClose,
}: {
  campaign: Campaign | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const isEditing = !!campaign;

  const [name, setName] = useState(campaign?.name ?? "");
  const [objective, setObjective] = useState(campaign?.objective ?? "");
  const [audience, setAudience] = useState(campaign?.audience ?? "");
  const [tone, setTone] = useState(campaign?.tone ?? "");
  const [channels, setChannels] = useState<CampaignChannel[]>(campaign?.channels ?? []);
  const [launchDate, setLaunchDate] = useState(campaign?.launchDate ?? "");

  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      addToast("success", "Campaign created!");
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      void queryClient.invalidateQueries({ queryKey: ["active-campaign"] });
      onClose();
    },
    onError: () => addToast("error", "Failed to create campaign"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Campaign>) => updateCampaign(campaign!.id, data),
    onSuccess: () => {
      addToast("success", "Campaign updated!");
      void queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      void queryClient.invalidateQueries({ queryKey: ["active-campaign"] });
      onClose();
    },
    onError: () => addToast("error", "Failed to update campaign"),
  });

  function toggleChannel(ch: CampaignChannel) {
    setChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      addToast("error", "Campaign name is required");
      return;
    }

    const data = {
      name: name.trim(),
      objective,
      audience,
      tone,
      channels,
      launchDate,
      status: "draft" as const,
    };

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold text-text-primary">
          {isEditing ? "Edit Campaign" : "New Campaign"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-text-muted">Campaign Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Summer Sale 2026"
              className="h-9 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-text-muted">Objective</label>
            <input
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Drive brand awareness and sales"
              className="h-9 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-text-muted">Target Audience</label>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Gen-Z creators"
                className="h-9 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-text-muted">Tone</label>
              <input
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="Bold, energetic"
                className="h-9 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-text-muted">Channels</label>
            <div className="flex flex-wrap gap-2">
              {allChannels.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    channels.includes(ch)
                      ? "bg-primary/15 text-primary-soft"
                      : "bg-surface-muted text-text-muted hover:bg-surface-elevated"
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-text-muted">Launch Date</label>
            <DatePicker value={launchDate} onChange={setLaunchDate} placeholder="Select launch date" />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
