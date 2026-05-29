"use client";

import { motion } from "framer-motion";
import { CalendarPlus, Download, Pencil, Save } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ImageEditModal } from "@/features/campaigns/image-edit-modal";
import { useToastStore } from "@/stores/toast-store";
import type { Asset } from "@/types/domain";

export function WorkspaceAssetCard({ asset, onSave, onSchedule, busy }: { asset: Asset; onSave: (a: Asset) => void; onSchedule: (a: Asset) => void; busy?: boolean }) {
  const [editing, setEditing] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  return (
    <>
      <motion.div className="group relative h-72 w-72 overflow-hidden rounded-card border" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
        <div className={cn("absolute inset-0", asset.preview)} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.55))] opacity-0 transition group-hover:opacity-100" />
        <Badge className="absolute left-3 top-3" tone="primary">{asset.channel}</Badge>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 p-3 opacity-0 transition group-hover:opacity-100">
          <IconButton label="Download" onClick={() => addToast("success", "Downloaded")} disabled={busy}><Download className="h-4 w-4" /></IconButton>
          <IconButton label="Save to Library" onClick={() => onSave(asset)} disabled={busy}><Save className="h-4 w-4" /></IconButton>
          <IconButton label="Schedule" onClick={() => onSchedule(asset)} disabled={busy}><CalendarPlus className="h-4 w-4" /></IconButton>
          <IconButton label="Edit" onClick={() => setEditing(true)} disabled={busy}><Pencil className="h-4 w-4" /></IconButton>
        </div>
      </motion.div>

      {editing && <ImageEditModal asset={asset} onClose={() => setEditing(false)} />}
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
