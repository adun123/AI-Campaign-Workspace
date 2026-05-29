"use client";

import { Brush, Eraser, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToastStore } from "@/stores/toast-store";
import type { Asset } from "@/types/domain";

export function ImageEditModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [instruction, setInstruction] = useState("");
  const [hasMask, setHasMask] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  function getPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
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
    ctx.lineWidth = 24;
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

  function applyEdit() {
    addToast("success", `Edit applied: ${instruction || "masked area regenerated"}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-card border bg-surface p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Edit · {asset.title}</h3>
            <p className="text-xs text-text-muted">Brush over the area to change, then describe the edit.</p>
          </div>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mt-4 h-72 w-full overflow-hidden rounded-card">
          <div className={`absolute inset-0 ${asset.preview}`} />
          <canvas
            ref={canvasRef}
            width={560}
            height={288}
            className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
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
          placeholder="e.g. remove this object, add a hat, change background..."
          className="mt-3 h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
        />

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={applyEdit} disabled={!hasMask}>Apply Edit</Button>
        </div>
      </div>
    </div>
  );
}
