"use client";

import { Check, Type, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type TextOverlayConfig = {
  text: string;
  fontSize: number;
  fontColor: string;
  fontFamily: string;
  position: "top" | "center" | "bottom";
  bold: boolean;
};

const DEFAULT_CONFIG: TextOverlayConfig = {
  text: "",
  fontSize: 32,
  fontColor: "#ffffff",
  fontFamily: "Arial",
  position: "bottom",
  bold: true,
};

const FONTS = ["Arial", "Georgia", "Impact", "Courier New", "Verdana", "Trebuchet MS"];
const COLORS = ["#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff69b4", "#ffa500"];

export function TextOverlayModal({
  imageUrl,
  onClose,
  onSave,
}: {
  imageUrl: string;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}) {
  const [config, setConfig] = useState<TextOverlayConfig>(DEFAULT_CONFIG);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !config.text) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);

    const fontWeight = config.bold ? "bold" : "normal";
    ctx.font = `${fontWeight} ${config.fontSize}px "${config.fontFamily}"`;
    ctx.fillStyle = config.fontColor;
    ctx.textAlign = "center";

    // Shadow for readability
    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const x = canvas.width / 2;
    let y: number;
    switch (config.position) {
      case "top":
        y = config.fontSize + 40;
        break;
      case "center":
        y = canvas.height / 2;
        break;
      case "bottom":
        y = canvas.height - config.fontSize - 40;
        break;
    }

    ctx.fillText(config.text, x, y);
  }, [config]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
    img.src = imageUrl;
  }, [imageUrl, drawCanvas]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL("image/png"));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-card border bg-surface p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Type className="h-4 w-4" />
            Add Text Overlay
          </h3>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-primary" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preview */}
          <div className="relative overflow-hidden rounded-control border bg-black">
            <canvas ref={canvasRef} className="w-full h-auto" style={{ maxHeight: 320 }} />
            {!config.text && (
              <div className="absolute inset-0 flex items-center justify-center text-text-muted/50 text-sm">
                Type text below to preview
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-text-muted mb-1 block">Text</label>
              <input
                value={config.text}
                onChange={(e) => setConfig({ ...config, text: e.target.value })}
                placeholder="Type your text here..."
                className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-text-muted mb-1 block">Font</label>
                <select
                  value={config.fontFamily}
                  onChange={(e) => setConfig({ ...config, fontFamily: e.target.value })}
                  className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
                >
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-text-muted mb-1 block">Size: {config.fontSize}px</label>
                <input
                  type="range"
                  min="12"
                  max="120"
                  value={config.fontSize}
                  onChange={(e) => setConfig({ ...config, fontSize: Number(e.target.value) })}
                  className="w-full mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-text-muted mb-1 block">Position</label>
                <div className="flex gap-1">
                  {(["top", "center", "bottom"] as const).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setConfig({ ...config, position: pos })}
                      className={`flex-1 rounded-control border px-2 py-1.5 text-xs font-medium capitalize transition ${
                        config.position === pos
                          ? "border-primary bg-primary/12 text-text-primary"
                          : "bg-surface-muted text-text-muted hover:bg-surface-elevated"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-text-muted mb-1 block">Style</label>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, bold: !config.bold })}
                  className={`w-full rounded-control border px-3 py-1.5 text-xs font-medium transition ${
                    config.bold
                      ? "border-primary bg-primary/12 font-bold text-text-primary"
                      : "bg-surface-muted text-text-muted hover:bg-surface-elevated"
                  }`}
                >
                  Bold
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-text-muted mb-1 block">Color</label>
              <div className="flex gap-1.5 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setConfig({ ...config, fontColor: c })}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition ${
                      config.fontColor === c ? "border-primary scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {config.fontColor === c && <Check className="h-3.5 w-3.5" style={{ color: c === "#000000" ? "#fff" : "#000" }} />}
                  </button>
                ))}
                <input
                  type="color"
                  value={config.fontColor}
                  onChange={(e) => setConfig({ ...config, fontColor: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded-full border-0 bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t pt-3">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={!config.text}>
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Apply Text
          </Button>
        </div>
      </div>
    </div>
  );
}
