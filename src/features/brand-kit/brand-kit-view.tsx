"use client";

import { Check, Eraser, ImagePlus, Loader2, Palette, Plus, ShieldCheck, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { useToastStore } from "@/stores/toast-store";
import { useQuery } from "@tanstack/react-query";
import { listBrandKits, createBrandKit, updateBrandKit } from "@/services/brand-kit.service";
import type { BrandKit, LogoPosition } from "@/types/domain";

export function BrandKitView() {
  const addToast = useToastStore((s) => s.addToast);
  const { data: fetchedKits = [] } = useQuery({ queryKey: ["brand-kits"], queryFn: listBrandKits });
  const [kits, setKits] = useState<BrandKit[]>([]);
  const allKits = kits.length > 0 ? kits : fetchedKits;
  const [activeId, setActiveId] = useState(allKits[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const kit = allKits.find((k) => k.id === activeId);

  function updateKit(updates: Partial<BrandKit>) {
    setKits((prev) => (prev.length > 0 ? prev : fetchedKits).map((k) => (k.id === activeId ? { ...k, ...updates } : k)));
  }

  async function createNewKit() {
    const optimistic: BrandKit = {
      id: `temp_${Date.now()}`,
      workspaceId: "temp",
      name: "New Brand Kit",
      voice: "",
      colors: ["#7C3AED"],
      logoUrl: "",
      guardrails: [],
      logoEnabled: false,
      logoPosition: "bottom-right",
      logoSizePercent: 15,
      voiceEnabled: true,
      colorsEnabled: true,
      guardrailsEnabled: true,
      typography: "",
      typographyEnabled: false,
      brandValues: [],
      brandValuesEnabled: false,
    };
    setKits((prev) => [...prev, optimistic]);
    setActiveId(optimistic.id);

    try {
      const created = await createBrandKit(optimistic);
      setKits((prev) => prev.map((k) => (k.id === optimistic.id ? created : k)));
      setActiveId(created.id);
      addToast("success", "New brand kit created");
    } catch {
      setKits((prev) => prev.filter((k) => k.id !== optimistic.id));
      addToast("error", "Failed to create brand kit");
    }
  }

  async function handleSave() {
    if (!kit) return;
    setSaving(true);
    try {
      await updateBrandKit(kit.id, kit);
      addToast("success", "Brand kit saved");
    } catch {
      addToast("error", "Failed to save brand kit");
    } finally {
      setSaving(false);
    }
  }

  if (!kit) {
    return (
      <section className="space-y-5">
        <SectionHeading eyebrow="Brand Kit" title="Guardrails for every generation" />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Palette className="h-8 w-8 text-text-muted mb-3" />
            <p className="text-sm text-text-muted mb-4">No brand kits found</p>
            <Button variant="secondary" size="sm" onClick={createNewKit}>
              <Plus className="h-4 w-4" /> Create your first brand kit
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <SectionHeading eyebrow="Brand Kit" title="Brand identity for every generation" />

      {/* Kit selector */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={activeId} onChange={(e) => setActiveId(e.target.value)} className="h-10 rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60">
          {allKits.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
        </select>
        <Button variant="secondary" size="sm" onClick={createNewKit}><Plus className="h-4 w-4" /> New Kit</Button>
        <Badge tone="accent">Active</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left column: Name, Voice, Typography */}
        <div className="space-y-4">
          {/* Brand Identity Card */}
          <Card>
            <CardHeader><CardTitle>Brand Identity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Brand Name">
                <input value={kit.name} onChange={(e) => updateKit({ name: e.target.value })} className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60" />
              </Field>

              {/* Voice & Tone with toggle */}
              <TogglableField
                label="Voice & Tone"
                enabled={kit.voiceEnabled}
                onToggle={(v) => updateKit({ voiceEnabled: v })}
              >
                <textarea value={kit.voice} onChange={(e) => updateKit({ voice: e.target.value })} placeholder="Describe how your brand speaks..." disabled={!kit.voiceEnabled} className="min-h-24 w-full resize-none rounded-control border bg-surface-muted px-3 py-2 text-sm leading-6 text-text-primary outline-none focus:border-accent/60 disabled:opacity-50" />
              </TogglableField>

              {/* Typography with toggle */}
              <TogglableField
                label="Typography"
                enabled={kit.typographyEnabled}
                onToggle={(v) => updateKit({ typographyEnabled: v })}
              >
                <input
                  value={kit.typography}
                  onChange={(e) => updateKit({ typography: e.target.value })}
                  placeholder="e.g. Poppins, Inter, Roboto"
                  disabled={!kit.typographyEnabled}
                  className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60 disabled:opacity-50"
                />
                <p className="mt-1 text-[10px] text-text-muted">Font names for caption generation</p>
              </TogglableField>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Logo, Colors, Brand Values, Guardrails */}
        <div className="space-y-4">
          {/* Logo Upload & Overlay */}
          <LogoManagementCard kit={kit} updateKit={updateKit} />

          {/* Color Palette with toggle */}
          <TogglableField
            label="Color Palette"
            enabled={kit.colorsEnabled}
            onToggle={(v) => updateKit({ colorsEnabled: v })}
          >
            <ColorPalette colors={kit.colors} onChange={(colors) => updateKit({ colors })} />
          </TogglableField>

          {/* Brand Values with toggle */}
          <TogglableField
            label="Brand Values"
            enabled={kit.brandValuesEnabled}
            onToggle={(v) => updateKit({ brandValuesEnabled: v })}
          >
            <TagEditor
              tags={kit.brandValues}
              onChange={(tags) => updateKit({ brandValues: tags })}
              placeholder="e.g. innovative, trustworthy, playful..."
            />
            <p className="mt-1 text-[10px] text-text-muted">Keywords that define your brand personality</p>
          </TogglableField>

          {/* Creative Rules with toggle */}
          <TogglableField
            label="Creative Rules"
            enabled={kit.guardrailsEnabled}
            onToggle={(v) => updateKit({ guardrailsEnabled: v })}
          >
            <GuardrailsEditor guardrails={kit.guardrails} onChange={(guardrails) => updateKit({ guardrails })} />
          </TogglableField>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </section>
  );
}

// ─── Field Components ─────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</label>
      {children}
    </div>
  );
}

function TogglableField({ label, enabled, onToggle, children }: { label: string; enabled: boolean; onToggle: (value: boolean) => void; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</label>
        <button
          type="button"
          onClick={() => onToggle(!enabled)}
          aria-label={`Toggle ${label}`}
          className={`relative h-5 w-9 rounded-full transition-colors ${enabled ? "bg-accent/40" : "bg-border"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`}
          />
        </button>
      </div>
      <div className={enabled && !enabled ? "opacity-50" : ""}>
        {children}
      </div>
    </div>
  );
}

// ─── Logo Management ─────────────────────────────────────────────────────────

function LogoManagementCard({ kit, updateKit }: { kit: BrandKit; updateKit: (updates: Partial<BrandKit>) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("brand_kit_id", kit.id);

      const res = await fetch("/api/brand-kit/upload-logo", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      updateKit({ logoUrl: data.url });
    } catch {
      // fallback: set local URL if upload fails
      updateKit({ logoUrl: file.name });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-accent" />
            Logo Overlay
          </CardTitle>
          <button
            type="button"
            onClick={() => updateKit({ logoEnabled: !kit.logoEnabled })}
            aria-label="Toggle logo overlay"
            className={`relative h-5 w-9 rounded-full transition-colors ${kit.logoEnabled ? "bg-accent/40" : "bg-border"}`}
          >
            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${kit.logoEnabled ? "translate-x-4" : "translate-x-0"}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Logo Upload */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border bg-surface-muted">
            {kit.logoUrl && (kit.logoUrl.startsWith("http") || kit.logoUrl.startsWith("data:")) ? (
              <img src={kit.logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
            ) : (
              <ImagePlus className="h-5 w-5 text-text-muted" />
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          {kit.logoUrl && !uploading && (
            <button
              type="button"
              onClick={() => updateKit({ logoUrl: "" })}
              className="text-text-muted hover:text-error transition-colors"
              aria-label="Remove logo"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Only show position/size when logo is enabled */}
        {kit.logoEnabled && (
          <>
            {/* Position Selector */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-muted">Position</p>
              <div className="grid grid-cols-3 gap-1 w-fit rounded-control border bg-surface-muted p-1">
                {(
                  [
                    ["top-left", "top-center", "top-right"],
                    ["bottom-left", "center", "bottom-right"],
                    ["bottom-left", "bottom-center", "bottom-right"],
                  ] as LogoPosition[][]
                ).map((row, ri) => (
                  <div key={ri} className="flex gap-1">
                    {row.map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => updateKit({ logoPosition: pos })}
                        className={`h-8 w-8 rounded-sm border transition ${
                          kit.logoPosition === pos
                            ? "border-accent bg-accent/15 text-accent"
                            : "border-transparent hover:border-border text-text-muted"
                        }`}
                        title={pos.replace(/-/g, " ")}
                        aria-label={`Logo position: ${pos}`}
                      >
                        <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
                          {pos.includes("top") && pos.includes("left") && <circle cx="4" cy="4" r="2.5" />}
                          {pos.includes("top") && pos.includes("center") && !pos.includes("left") && !pos.includes("right") && <circle cx="8" cy="4" r="2.5" />}
                          {pos.includes("top") && pos.includes("right") && <circle cx="12" cy="4" r="2.5" />}
                          {pos === "center" && <circle cx="8" cy="8" r="2.5" />}
                          {pos.includes("bottom") && pos.includes("left") && <circle cx="4" cy="12" r="2.5" />}
                          {pos.includes("bottom") && pos.includes("center") && !pos.includes("left") && !pos.includes("right") && <circle cx="8" cy="12" r="2.5" />}
                          {pos.includes("bottom") && pos.includes("right") && <circle cx="12" cy="12" r="2.5" />}
                        </svg>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Size Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-text-muted">Size</p>
                <span className="text-xs text-accent font-medium">{kit.logoSizePercent}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                value={kit.logoSizePercent}
                onChange={(e) => updateKit({ logoSizePercent: parseInt(e.target.value) })}
                className="w-full accent-accent"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Tag Editor (for Brand Values) ─────────────────────────────────────────

function TagEditor({ tags, onChange, placeholder }: { tags: string[]; onChange: (tags: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");

  function addTag() {
    if (!input.trim() || tags.includes(input.trim())) return;
    onChange([...tags, input.trim()]);
    setInput("");
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2 py-0.5 text-xs font-medium text-accent">
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="text-text-muted hover:text-error transition-colors" aria-label="Remove tag">
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder ?? "Add a value..."}
          className="h-9 min-w-0 flex-1 rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
        />
        <Button variant="secondary" size="sm" onClick={addTag} disabled={!input.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Color Palette ─────────────────────────────────────────────────────────

function ColorPalette({ colors, onChange }: { colors: string[]; onChange: (colors: string[]) => void }) {
  function addColor() {
    onChange([...colors, "#ffffff"]);
  }
  function removeColor(index: number) {
    onChange(colors.filter((_, i) => i !== index));
  }
  function updateColor(index: number, value: string) {
    onChange(colors.map((c, i) => (i === index ? value : c)));
  }

  return (
    <div className="flex flex-wrap gap-3">
      {colors.map((color, i) => (
        <div key={i} className="group relative">
          <label className="block cursor-pointer">
            <input type="color" value={color} onChange={(e) => updateColor(i, e.target.value)} className="absolute inset-0 h-0 w-0 opacity-0" />
            <div className="h-10 w-10 rounded-full border-2 border-border transition group-hover:scale-110" style={{ backgroundColor: color }} />
          </label>
          <button type="button" onClick={() => removeColor(i)} className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-white opacity-0 transition group-hover:opacity-100" aria-label="Remove color">
            <Trash2 className="h-2.5 w-2.5" />
          </button>
        </div>
      ))}
      <button type="button" onClick={addColor} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-border text-text-muted transition hover:border-accent hover:text-accent" aria-label="Add color">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Guardrails Editor ─────────────────────────────────────────────────────

function GuardrailsEditor({ guardrails, onChange }: { guardrails: string[]; onChange: (g: string[]) => void }) {
  const [input, setInput] = useState("");

  function addRule() {
    if (!input.trim()) return;
    onChange([...guardrails, input.trim()]);
    setInput("");
  }

  function removeRule(index: number) {
    onChange(guardrails.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {guardrails.map((rule, i) => (
        <div key={i} className="flex items-center gap-2 rounded-control border bg-surface-muted px-3 py-2">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-accent" />
          <span className="flex-1 text-sm text-text-primary">{rule}</span>
          <button type="button" onClick={() => removeRule(i)} className="shrink-0 text-text-muted hover:text-error transition-colors" aria-label="Remove rule">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addRule(); } }} placeholder="Add a creative rule..." className="h-9 min-w-0 flex-1 rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60" />
        <Button variant="secondary" size="sm" onClick={addRule} disabled={!input.trim()}><Plus className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
