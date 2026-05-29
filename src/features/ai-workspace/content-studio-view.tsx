"use client";

import { useRouter } from "next/navigation";
import { LayoutTemplate, Send } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { templateCategories, templates, type Template, type TemplateCategory } from "@/lib/template-data";
import { useChatStore } from "@/stores/chat-store";
import { useToastStore } from "@/stores/toast-store";

export function ContentStudioView() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "All">("All");
  const [selected, setSelected] = useState<Template | null>(null);

  const filtered = activeCategory === "All" ? templates : templates.filter((t) => t.category === activeCategory);

  return (
    <section className="space-y-5">
      <SectionHeading eyebrow="Templates" title="Start from a proven format" />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <CategoryPill label="All" active={activeCategory === "All"} onClick={() => setActiveCategory("All")} />
        {templateCategories.map((cat) => (
          <CategoryPill key={cat} label={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)} />
        ))}
      </div>

      {/* Template grid or customize panel */}
      {selected ? (
        <TemplateCustomizer template={selected} onBack={() => setSelected(null)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tpl) => (
            <button key={tpl.id} type="button" onClick={() => setSelected(tpl)} className="group text-left">
              <Card className="h-full overflow-hidden transition group-hover:border-primary/40">
                <div className={`h-32 w-full ${tpl.preview}`} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">{tpl.name}</h3>
                    <Badge tone="accent" className="shrink-0">{tpl.category}</Badge>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-text-muted">{tpl.description}</p>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${active ? "border-primary bg-primary/12 text-text-primary" : "bg-surface-muted text-text-muted hover:bg-surface-elevated"}`}>
      {label}
    </button>
  );
}

function TemplateCustomizer({ template, onBack }: { template: Template; onBack: () => void }) {
  const router = useRouter();
  const addMessage = useChatStore((s) => s.addMessage);
  const addToast = useToastStore((s) => s.addToast);
  const [values, setValues] = useState<Record<string, string>>({});

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleUseInWorkspace() {
    const filled = template.fields.map((f) => `${f.label}: ${values[f.key] || f.placeholder}`).join("\n");
    const prompt = `[Template: ${template.name}]\n${filled}`;
    addMessage({ role: "user", content: prompt });
    addMessage({ role: "ai", content: "Generating from template..." });
    addToast("success", "Template sent to Workspace");
    router.push("/workspace");
  }

  return (
    <Card className="overflow-hidden">
      <div className={`h-40 w-full ${template.preview}`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-text-primary">{template.name}</h3>
            <p className="mt-1 text-sm text-text-muted">{template.description}</p>
          </div>
          <Badge tone="accent">{template.category}</Badge>
        </div>

        <div className="mt-5 space-y-4">
          {template.fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-text-muted">{field.label}</label>
              {field.type === "select" ? (
                <select value={values[field.key] ?? ""} onChange={(e) => handleChange(field.key, e.target.value)} className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60">
                  <option value="">Select...</option>
                  {field.options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : field.type === "textarea" ? (
                <textarea value={values[field.key] ?? ""} onChange={(e) => handleChange(field.key, e.target.value)} placeholder={field.placeholder} className="min-h-20 w-full resize-none rounded-control border bg-surface-muted px-3 py-2 text-sm text-text-primary outline-none focus:border-accent/60" />
              ) : (
                <input value={values[field.key] ?? ""} onChange={(e) => handleChange(field.key, e.target.value)} placeholder={field.placeholder} className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="secondary" onClick={onBack}><LayoutTemplate className="h-4 w-4" /> Back to Gallery</Button>
          <Button onClick={handleUseInWorkspace}><Send className="h-4 w-4" /> Use in Workspace</Button>
        </div>
      </CardContent>
    </Card>
  );
}
