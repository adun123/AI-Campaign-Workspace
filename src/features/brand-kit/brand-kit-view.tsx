"use client";

import { ImagePlus, Palette, Plus, ShieldCheck, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { useToastStore } from "@/stores/toast-store";
import { useQuery } from "@tanstack/react-query";
import { listBrandKits } from "@/services/brand-kit.service";
import type { BrandKit } from "@/types/domain";

export function BrandKitView() {
  const addToast = useToastStore((s) => s.addToast);
  const { data: fetchedKits = [] } = useQuery({ queryKey: ["brand-kits"], queryFn: listBrandKits });
  const [kits, setKits] = useState<BrandKit[]>([]);
  const allKits = kits.length > 0 ? kits : fetchedKits;
  const [activeId, setActiveId] = useState(allKits[0]?.id ?? "");
  const kit = allKits.find((k) => k.id === activeId);

  function updateKit(updates: Partial<BrandKit>) {
    setKits((prev) => (prev.length > 0 ? prev : fetchedKits).map((k) => (k.id === activeId ? { ...k, ...updates } : k)));
  }

  function createNewKit() {
    const newKit: BrandKit = {
      id: `brand_${Date.now()}`,
      workspaceId: kits[0]?.workspaceId ?? "workspace_01",
      name: "New Brand Kit",
      voice: "",
      colors: ["#7C3AED"],
      logoUrl: "",
      guardrails: [],
    };
    setKits((prev) => [...prev, newKit]);
    setActiveId(newKit.id);
    addToast("success", "New brand kit created");
  }

  function handleSave() {
    addToast("success", "Brand kit saved");
  }

  if (!kit) return null;

  return (
    <section className="space-y-5">
      <SectionHeading eyebrow="Brand Kit" title="Guardrails for every generation" />

      {/* Kit selector */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={activeId} onChange={(e) => setActiveId(e.target.value)} className="h-10 rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60">
          {kits.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
        </select>
        <Button variant="secondary" size="sm" onClick={createNewKit}><Plus className="h-4 w-4" /> New Kit</Button>
        <Badge tone="accent">Active</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left column: Name, Voice, Logo */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Brand Identity</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Brand Name">
                <input value={kit.name} onChange={(e) => updateKit({ name: e.target.value })} className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60" />
              </Field>
              <Field label="Voice & Tone">
                <textarea value={kit.voice} onChange={(e) => updateKit({ voice: e.target.value })} placeholder="Describe how your brand speaks..." className="min-h-24 w-full resize-none rounded-control border bg-surface-muted px-3 py-2 text-sm leading-6 text-text-primary outline-none focus:border-accent/60" />
              </Field>
              <Field label="Logo">
                <LogoUpload logoUrl={kit.logoUrl} onChange={(url) => updateKit({ logoUrl: url })} />
              </Field>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Colors, Guardrails */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-4 w-4 text-accent" /> Color Palette</CardTitle></CardHeader>
            <CardContent>
              <ColorPalette colors={kit.colors} onChange={(colors) => updateKit({ colors })} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> Creative Rules</CardTitle></CardHeader>
            <CardContent>
              <GuardrailsEditor guardrails={kit.guardrails} onChange={(guardrails) => updateKit({ guardrails })} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Button onClick={handleSave}>Save Changes</Button>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</label>
      {children}
    </div>
  );
}

function LogoUpload({ logoUrl, onChange }: { logoUrl: string; onChange: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      onChange(file.name);
    }
    e.target.value = "";
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border bg-surface-muted">
        {preview ? (
          <img src={preview} alt="Logo" className="h-full w-full object-cover" />
        ) : logoUrl ? (
          <span className="text-sm font-semibold text-text-primary">{logoUrl}</span>
        ) : (
          <ImagePlus className="h-5 w-5 text-text-muted" />
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Upload</Button>
    </div>
  );
}

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
          <button type="button" onClick={() => removeRule(i)} className="shrink-0 text-text-muted hover:text-error" aria-label="Remove rule">
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
