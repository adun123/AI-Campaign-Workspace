"use client";

import * as React from "react";
import { Settings2, Image as ImageIcon, Type, Video, MessageSquare } from "lucide-react";
import { cn } from "@/lib/cn";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/stores/ui.store";
import type { AIModel, AssetType, Campaign } from "@/types";

interface PropertiesPanelProps {
  campaign: Campaign;
  outputType: AssetType;
  onChangeOutputType: (t: AssetType) => void;
  model: AIModel;
  onChangeModel: (m: AIModel) => void;
  tone: string;
  onChangeTone: (t: string) => void;
  aspectRatio: "1:1" | "4:5" | "9:16" | "16:9";
  onChangeAspectRatio: (a: "1:1" | "4:5" | "9:16" | "16:9") => void;
}

const OUTPUT_TYPES: { value: AssetType; label: string; icon: typeof ImageIcon }[] = [
  { value: "image", label: "Image", icon: ImageIcon },
  { value: "video", label: "Video", icon: Video },
  { value: "caption", label: "Caption", icon: MessageSquare },
  { value: "copy", label: "Copy", icon: Type },
];

const TONES = ["confident", "playful", "calm", "urgent", "minimal"];
const RATIOS: ("1:1" | "4:5" | "9:16" | "16:9")[] = ["1:1", "4:5", "9:16", "16:9"];

export function PropertiesPanel(props: PropertiesPanelProps) {
  const open = useUIStore((s) => s.propertiesPanelOpen);
  if (!open) return null;

  const isVisual = props.outputType === "image" || props.outputType === "video";

  return (
    <aside
      className="hidden w-[300px] shrink-0 border-l border-border bg-surface/40 xl:flex xl:flex-col"
      aria-label="Generation properties"
    >
      <div className="flex h-12 items-center gap-2 border-b border-border px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <Settings2 className="h-3.5 w-3.5" />
        Properties
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-5 scrollbar-thin">
        <Group label="Output">
          <div className="grid grid-cols-2 gap-2">
            {OUTPUT_TYPES.map((t) => {
              const Icon = t.icon;
              const active = props.outputType === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => props.onChangeOutputType(t.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-2.5 py-2 text-xs transition-colors",
                    active
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </Group>

        <Separator />

        <Group label="Model">
          <select
            value={props.model}
            onChange={(e) => props.onChangeModel(e.target.value as AIModel)}
            className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ideation-v1">Ideation v1</option>
            <option value="copy-v1">Copy v1</option>
            <option value="image-v1">Image v1</option>
            <option value="video-v1">Video v1</option>
          </select>
        </Group>

        <Group label="Tone">
          <div className="flex flex-wrap gap-1.5">
            {TONES.map((t) => {
              const active = props.tone === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => props.onChangeTone(t)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs capitalize transition-colors",
                    active
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border bg-surface text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </Group>

        {isVisual ? (
          <Group label="Aspect ratio">
            <div className="grid grid-cols-4 gap-2">
              {RATIOS.map((r) => {
                const active = props.aspectRatio === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => props.onChangeAspectRatio(r)}
                    className={cn(
                      "rounded-md border px-2 py-1.5 text-xs transition-colors",
                      active
                        ? "border-primary/40 bg-primary/10 text-foreground"
                        : "border-border bg-surface text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </Group>
        ) : null}

        <Separator />

        <Group label="Brand kit">
          <div className="rounded-md border border-border bg-surface p-3">
            <p className="text-sm font-medium text-foreground">Northwind Core</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {props.campaign.channels.length} channels · tone locked
            </p>
          </div>
        </Group>
      </div>
    </aside>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
