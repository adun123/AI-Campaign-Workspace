"use client";

import { motion } from "framer-motion";
import { CalendarPlus, Download, Save, Type } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ImageWithLogo, type LogoOverlayData } from "@/components/image-with-logo";
import { ImageDetailPopup } from "@/features/campaigns/image-detail-popup";
import { TextOverlayModal } from "@/features/campaigns/text-overlay-modal";
import { downloadFile } from "@/lib/download";
import { useToastStore } from "@/stores/toast-store";
import type { Asset } from "@/types/domain";

function downloadAsset(asset: Asset) {
  if (!asset.preview) return;
  downloadFile(asset.preview, `${asset.title || "image"}.png`).catch(() => {
    // Fallback: open in new tab if fetch fails
    window.open(asset.preview, "_blank");
  });
}

export function WorkspaceAssetCard({ asset, logoOverlay, onSave, onSchedule, onEditComplete, busy }: { asset: Asset; logoOverlay?: LogoOverlayData; onSave: (a: Asset) => void; onSchedule: (a: Asset) => void; onEditComplete?: (instruction: string, newAsset: Asset) => void; busy?: boolean }) {
  const [showDetail, setShowDetail] = useState(false);
  const [showTextOverlay, setShowTextOverlay] = useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const isImage = asset.kind === "image" && (asset.preview?.startsWith("http") || asset.preview?.startsWith("data:"));

  function handleTextOverlaySave(dataUrl: string) {
    // Create a modified asset with the text overlay
    const modifiedAsset: Asset = {
      ...asset,
      preview: dataUrl,
      title: `${asset.title} (with text)`,
    };
    onEditComplete?.("Added text overlay", modifiedAsset);
    setShowTextOverlay(false);
    addToast("success", "Text overlay applied");
  }

  return (
    <>
      <motion.div
        className="group relative w-full overflow-hidden rounded-card border bg-surface-muted"
        style={{ aspectRatio: "1 / 1" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        {isImage ? (
          <div className="absolute inset-0 h-full w-full cursor-pointer overflow-hidden" onClick={() => setShowDetail(true)}>
            <ImageWithLogo
              src={asset.preview}
              alt={asset.title ?? "Generated"}
              logoOverlay={logoOverlay}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex cursor-pointer flex-col justify-between bg-surface-muted p-4" onClick={() => setShowDetail(true)}>
            <Badge tone="primary" className="self-start">{asset.channel}</Badge>
            <p className="line-clamp-8 text-sm leading-relaxed text-text-primary">{asset.preview}</p>
            <p className="text-xs text-text-muted">{asset.title}</p>
          </div>
        )}
        {isImage && <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.55))] opacity-0 transition group-hover:opacity-100" />}
        {isImage && <Badge className="absolute left-3 top-3" tone="primary">{asset.channel}</Badge>}

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-3 opacity-0 transition group-hover:opacity-100">
          <IconButton label="Download" onClick={() => { downloadAsset(asset); addToast("success", "Downloaded"); }} disabled={busy}><Download className="h-4 w-4" /></IconButton>
          {isImage && <IconButton label="Add Text" onClick={() => setShowTextOverlay(true)} disabled={busy}><Type className="h-4 w-4" /></IconButton>}
          <IconButton label="Save to Library" onClick={() => onSave(asset)} disabled={busy}><Save className="h-4 w-4" /></IconButton>
          <IconButton label="Schedule" onClick={() => onSchedule(asset)} disabled={busy}><CalendarPlus className="h-4 w-4" /></IconButton>
        </div>
      </motion.div>

      {showDetail && <ImageDetailPopup asset={asset} logoOverlay={logoOverlay} onClose={() => setShowDetail(false)} onSave={onSave} onSchedule={onSchedule} onEditComplete={onEditComplete} />}
      {showTextOverlay && asset.preview && <TextOverlayModal imageUrl={asset.preview} onClose={() => setShowTextOverlay(false)} onSave={handleTextOverlaySave} />}
    </>
  );
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 disabled:opacity-50"
    >
      {children}
    </button>
  );
}
