"use client";

import { Brush, Eraser, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToastStore } from "@/stores/toast-store";
import type { Asset } from "@/types/domain";

export function ImageEditModal({ asset, onClose, onEditComplete }: { asset: Asset; onClose: () => void; onEditComplete?: (instruction: string, newAsset: Asset) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const [instruction, setInstruction] = useState("");
  const [hasMask, setHasMask] = useState(false);
  const [loading, setLoading] = useState(false);
  // Track scale and offset to convert mouse coords -> image coords
  const imgLayout = useRef({ x: 0, y: 0, w: 1, h: 1, naturalW: 560, naturalH: 288 });
  const addToast = useToastStore((s) => s.addToast);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    imgLayout.current.naturalW = img.naturalWidth;
    imgLayout.current.naturalH = img.naturalHeight;
    updateLayout();
  }

  function updateLayout() {
    if (!containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const nat = imgLayout.current;
    const aspectRatio = nat.naturalW / nat.naturalH;
    const containerAspect = container.width / container.height;

    // Replicate object-contain sizing
    let displayW: number, displayH: number, offsetX: number, offsetY: number;
    if (aspectRatio > containerAspect) {
      // Image wider than container — letterbox top/bottom
      displayW = container.width;
      displayH = container.width / aspectRatio;
      offsetX = 0;
      offsetY = (container.height - displayH) / 2;
    } else {
      // Image taller than container — letterbox left/right
      displayH = container.height;
      displayW = container.height * aspectRatio;
      offsetX = (container.width - displayW) / 2;
      offsetY = 0;
    }

    imgLayout.current = { x: offsetX, y: offsetY, w: displayW, h: displayH, naturalW: nat.naturalW, naturalH: nat.naturalH };

    // Resize canvas to match image display area exactly
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = nat.naturalW;
      canvas.height = nat.naturalH;
      canvas.style.left = `${offsetX}px`;
      canvas.style.top = `${offsetY}px`;
      canvas.style.width = `${displayW}px`;
      canvas.style.height = `${displayH}px`;
    }
  }

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    updateLayout(); // ensure layout is fresh
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.strokeStyle = "rgba(124,58,237,0.5)";
    // Scale brush size relative to image (roughly 2-4% of smaller dimension)
    const canvas = canvasRef.current!;
    ctx.lineWidth = Math.max(12, Math.min(canvas.width, canvas.height) * 0.03);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasMask(true);
  }

  function stop() {
    drawing.current = false;
  }

  function clearMask() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasMask(false);
  }

  // Convert brush strokes (purple on transparent) to proper inpainting mask (white on black)
  function generateMaskDataURL(): string | null {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext("2d");
    if (!maskCtx) return null;

    // Create mask: white where brushed, black where not
    const maskData = maskCtx.createImageData(width, height);
    const maskPixels = maskData.data;

    for (let i = 0; i < data.length; i += 4) {
      // If pixel has any alpha (i.e. was drawn on), mark as white in mask
      const hasBrush = data[i + 3] > 10;
      maskPixels[i] = hasBrush ? 255 : 0;     // R
      maskPixels[i + 1] = hasBrush ? 255 : 0; // G
      maskPixels[i + 2] = hasBrush ? 255 : 0; // B
      maskPixels[i + 3] = 255;                 // A (always opaque)
    }

    maskCtx.putImageData(maskData, 0, 0);
    return maskCanvas.toDataURL("image/png");
  }

  async function applyEdit() {
    if (!instruction.trim() && !hasMask) return;
    setLoading(true);
    try {
      // Generate proper mask only if user has drawn brush strokes
      const mask = hasMask ? generateMaskDataURL() : undefined;

      const res = await fetch("/api/generate/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_id: asset.id,
          campaign_id: asset.campaignId,
          source_image: asset.preview,
          instruction: instruction || "Regenerate the masked area",
          mask,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Edit failed");
      }
      const data = await res.json();
      addToast("success", "Edit generated!");
      onEditComplete?.(instruction || "Regenerate the masked area", data.asset);
      onClose();
    } catch (err: unknown) {
      addToast("error", err instanceof Error ? err.message : "Edit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-card border bg-surface p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Edit · {asset.title}</h3>
            <p className="text-xs text-text-muted">Describe the edit · Brush over areas for precise changes</p>
          </div>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={containerRef} className="relative mt-4 h-72 w-full overflow-hidden rounded-card border bg-black/5">
          <img 
            src={asset.preview} 
            alt={asset.title ?? "Source"} 
            className="absolute inset-0 h-full w-full object-contain"
            onLoad={onImageLoad}
          />
          <canvas
            ref={canvasRef}
            width={560}
            height={288}
            className="absolute cursor-crosshair touch-none"
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={stop}
            onPointerLeave={stop}
          />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-control border bg-primary/10 px-3 py-1.5 text-xs text-primary-soft"><Brush className="h-3.5 w-3.5" /> Mask brush</span>
          <Button variant="ghost" size="sm" onClick={clearMask} disabled={!hasMask}><Eraser className="h-4 w-4" /> Clear</Button>
        </div>

        <input
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. change background to sunset beach, remove the text, add sunglasses..."
          className="mt-3 h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
        />

        <p className="mt-1.5 text-[10px] text-text-muted">
          {hasMask ? "Inpainting mode — only the masked area will change" : "Full edit mode — describe what to change"}
        </p>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={applyEdit} disabled={(!hasMask && !instruction.trim()) || loading}>
            {loading ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Generating...</> : "Apply Edit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
