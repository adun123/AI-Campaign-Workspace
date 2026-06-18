"use client";

import { CalendarPlus, Copy, Download, Pencil, Save, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ImageEditModal } from "@/features/campaigns/image-edit-modal";
import { useToastStore } from "@/stores/toast-store";
import type { Asset } from "@/types/domain";

function downloadAsset(asset: Asset) {
  if (!asset.preview) return;
  const a = document.createElement("a");
  a.href = asset.preview;
  a.download = `${asset.title || "image"}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function ImageDetailPopup({ asset, onClose, onSave, onSchedule, onEditComplete }: { asset: Asset; onClose: () => void; onSave: (a: Asset) => void; onSchedule: (a: Asset) => void; onEditComplete?: (instruction: string, newAsset: Asset) => void }) {
  const [editing, setEditing] = useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const isImage = asset.kind === "image" && (asset.preview?.startsWith("http") || asset.preview?.startsWith("data:"));

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
        <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-card border bg-surface p-4 shadow-soft" onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70" aria-label="Close">
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          {isImage ? (
            <div className="flex items-center justify-center overflow-hidden rounded-card bg-black/20">
              <img src={asset.preview} alt={asset.title ?? "Image"} className="max-h-[65vh] w-auto object-contain" />
            </div>
          ) : (
            <div className="rounded-card bg-surface-muted p-6">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">{asset.preview}</p>
            </div>
          )}

          {/* Info + actions */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-text-primary">{asset.title}</h3>
              <div className="mt-1 flex items-center gap-2">
                <Badge tone="primary">{asset.channel}</Badge>
                {asset.prompt && <p className="truncate text-xs text-text-muted">{asset.prompt}</p>}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {isImage ? (
                <IconBtn label="Download" onClick={() => { downloadAsset(asset); addToast("success", "Downloaded"); }}><Download className="h-4 w-4" /></IconBtn>
              ) : (
                <IconBtn label="Copy" onClick={() => { void navigator.clipboard.writeText(asset.preview); addToast("success", "Copied to clipboard"); }}><Copy className="h-4 w-4" /></IconBtn>
              )}
              <IconBtn label="Save to Library" onClick={() => { onSave(asset); onClose(); }}><Save className="h-4 w-4" /></IconBtn>
              <IconBtn label="Schedule" onClick={() => { onSchedule(asset); onClose(); }}><CalendarPlus className="h-4 w-4" /></IconBtn>
              {isImage && <IconBtn label="Edit" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /></IconBtn>}
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <ImageEditModal
          asset={asset}
          onClose={() => setEditing(false)}
          onEditComplete={(instruction, newAsset) => {
            setEditing(false);
            onClose();
            onEditComplete?.(instruction, newAsset);
          }}
        />
      )}
    </>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="flex h-9 w-9 items-center justify-center rounded-full border text-text-muted transition hover:bg-surface-elevated hover:text-text-primary">
      {children}
    </button>
  );
}
