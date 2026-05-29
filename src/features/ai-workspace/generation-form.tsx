"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, WandSparkles } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { GenerationMode } from "@/types/domain";

const schema = z.object({
  prompt: z.string().min(12, "Describe the concept in at least 12 characters."),
  mode: z.enum(["text-to-image", "image-to-image"]),
  sourceAssetId: z.string().optional(),
});

export type GenerationFormValues = z.infer<typeof schema>;

export function GenerationForm({ onSubmit, isGenerating }: { onSubmit: (values: GenerationFormValues) => void; isGenerating: boolean }) {
  const form = useForm<GenerationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mode: "text-to-image",
      prompt: "Create a premium launch visual system for a calm AI campaign workspace.",
      sourceAssetId: "asset_01",
    },
  });

  const mode = useWatch({ control: form.control, name: "mode" });

  function setMode(nextMode: GenerationMode) {
    form.setValue("mode", nextMode, { shouldValidate: true });
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => setMode("text-to-image")} className={`rounded-control border p-3 text-left transition ${mode === "text-to-image" ? "border-primary bg-primary/10" : "bg-surface-muted hover:bg-surface-elevated"}`}>
          <WandSparkles className="h-4 w-4 text-accent" />
          <p className="mt-2 text-sm font-medium text-text-primary">Text to image</p>
          <p className="text-xs leading-5 text-text-muted">Generate new campaign directions from a written brief.</p>
        </button>
        <button type="button" onClick={() => setMode("image-to-image")} className={`rounded-control border p-3 text-left transition ${mode === "image-to-image" ? "border-primary bg-primary/10" : "bg-surface-muted hover:bg-surface-elevated"}`}>
          <ImagePlus className="h-4 w-4 text-accent" />
          <p className="mt-2 text-sm font-medium text-text-primary">Image to image</p>
          <p className="text-xs leading-5 text-text-muted">Use a saved asset as a visual seed and refine it.</p>
        </button>
      </div>
      {mode === "image-to-image" ? <Input placeholder="Source asset id" {...form.register("sourceAssetId")} /> : null}
      <Textarea placeholder="Write a campaign idea, visual direction, or iteration request..." {...form.register("prompt")} />
      {form.formState.errors.prompt ? <p className="text-sm text-error">{form.formState.errors.prompt.message}</p> : null}
      <Button className="w-full" type="submit" disabled={isGenerating}>
        <WandSparkles className="h-4 w-4" /> {isGenerating ? "Generation queued..." : "Generate"}
      </Button>
    </form>
  );
}
