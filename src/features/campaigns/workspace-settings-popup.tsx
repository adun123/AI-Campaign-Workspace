"use client";

import { MessageSquarePlus, Settings2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/chat-store";
import { useToastStore } from "@/stores/toast-store";
import type { Campaign } from "@/types/domain";

const audienceSuggestions = ["Seed-stage SaaS operators", "Gen-Z content creators", "SMB marketing teams", "Design-forward founders"];
const toneSuggestions = ["Calm, precise, premium", "Bold, energetic, playful", "Professional, trustworthy", "Casual, friendly, relatable"];

export function WorkspaceHeaderActions({ campaign }: { campaign: Campaign }) {
  return (
    <div className="flex items-center gap-1">
      <NewChatButton />
      <SettingsPopup campaign={campaign} />
    </div>
  );
}

function NewChatButton() {
  const addMessage = useChatStore((s) => s.addMessage);
  const loadHistory = useChatStore((s) => s.loadHistory);
  const addToast = useToastStore((s) => s.addToast);

  function handleNewChat() {
    loadHistory([]);
    addMessage({ role: "ai", content: "New conversation started. What do you want to create?" });
    addToast("info", "New chat started");
  }

  return (
    <button type="button" onClick={handleNewChat} title="New chat" aria-label="New chat" className="rounded-control p-2 text-text-muted transition hover:bg-surface-elevated hover:text-text-primary">
      <MessageSquarePlus className="h-5 w-5" />
    </button>
  );
}

function SettingsPopup({ campaign }: { campaign: Campaign }) {
  const [open, setOpen] = useState(false);
  const [audience, setAudience] = useState(campaign.audience);
  const [tone, setTone] = useState(campaign.tone);
  const [launchDate, setLaunchDate] = useState(campaign.launchDate);
  const addToast = useToastStore((s) => s.addToast);

  function handleSave() {
    addToast("success", "Settings updated");
    setOpen(false);
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="rounded-control p-2 text-text-muted transition hover:bg-surface-elevated hover:text-text-primary" aria-label="Workspace settings">
        <Settings2 className="h-5 w-5" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-card border bg-surface/95 p-4 shadow-soft backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">Workspace Settings</h3>
              <button type="button" onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>

            <div className="mt-4 space-y-4">
              <EditableField label="Audience" value={audience} onChange={setAudience} suggestions={audienceSuggestions} />
              <EditableField label="Tone" value={tone} onChange={setTone} suggestions={toneSuggestions} />
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-text-muted">Launch Date</label>
                <input type="date" value={launchDate} onChange={(e) => setLaunchDate(e.target.value)} className="h-9 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-text-muted">Channels</label>
                <p className="rounded-control border bg-surface-muted px-3 py-2 text-sm text-text-primary">{campaign.channels.join(", ")}</p>
              </div>
            </div>

            <Button className="mt-4 w-full" size="sm" onClick={handleSave}>Save Settings</Button>
          </div>
        </>
      )}
    </div>
  );
}

function EditableField({ label, value, onChange, suggestions }: { label: string; value: string; onChange: (v: string) => void; suggestions: string[] }) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-wider text-text-muted">{label}</label>
      <div className="relative">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="h-9 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60"
        />
        {showSuggestions && (
          <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-control border bg-surface/95 p-1 shadow-soft backdrop-blur-xl">
            {suggestions.map((s) => (
              <button key={s} type="button" onMouseDown={() => { onChange(s); setShowSuggestions(false); }} className="w-full rounded-control px-3 py-1.5 text-left text-xs text-text-muted transition hover:bg-surface-elevated hover:text-text-primary">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
