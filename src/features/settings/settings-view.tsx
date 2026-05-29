"use client";

import { AlertTriangle, Bell, Link2, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { currentUser, currentWorkspace } from "@/lib/mock-data";
import { aiModels } from "@/stores/chat-store";
import { useToastStore } from "@/stores/toast-store";

type SettingsTab = "profile" | "ai" | "notifications" | "connected" | "danger";

const tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "ai", label: "AI Preferences", icon: Sparkles },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "connected", label: "Connected", icon: Link2 },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  return (
    <section className="space-y-5">
      <SectionHeading eyebrow="Settings" title="Workspace preferences" />

      {/* Tab nav */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 rounded-control px-3 py-2 text-xs font-medium transition ${activeTab === tab.id ? "bg-primary/12 text-text-primary" : "text-text-muted hover:bg-surface-elevated hover:text-text-primary"}`}>
            <tab.icon className="h-3.5 w-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && <ProfileSection />}
      {activeTab === "ai" && <AIPreferencesSection />}
      {activeTab === "notifications" && <NotificationsSection />}
      {activeTab === "connected" && <ConnectedSection />}
      {activeTab === "danger" && <DangerSection />}
    </section>
  );
}

function ProfileSection() {
  const addToast = useToastStore((s) => s.addToast);
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);

  return (
    <Card>
      <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">{currentUser.avatarInitials}</div>
          <div>
            <p className="text-sm font-medium text-text-primary">{name}</p>
            <p className="text-xs text-text-muted">{currentWorkspace.name}</p>
            <Badge tone="accent" className="mt-1">{currentWorkspace.plan} plan</Badge>
          </div>
        </div>
        <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60" /></Field>
        <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60" /></Field>
        <Field label="Workspace Name"><input defaultValue={currentWorkspace.name} className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60" /></Field>
        <Button size="sm" onClick={() => addToast("success", "Profile saved")}>Save Profile</Button>
      </CardContent>
    </Card>
  );
}

function AIPreferencesSection() {
  const addToast = useToastStore((s) => s.addToast);
  const [model, setModel] = useState("auto");
  const [tone, setTone] = useState("Calm, precise, premium");
  const [autoSave, setAutoSave] = useState(true);

  return (
    <Card>
      <CardHeader><CardTitle>AI Preferences</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Field label="Default Model">
          <select value={model} onChange={(e) => setModel(e.target.value)} className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60">
            {aiModels.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </Field>
        <Field label="Default Tone">
          <input value={tone} onChange={(e) => setTone(e.target.value)} className="h-10 w-full rounded-control border bg-surface-muted px-3 text-sm text-text-primary outline-none focus:border-accent/60" />
        </Field>
        <Toggle label="Auto-save generated results to Asset Library" checked={autoSave} onChange={setAutoSave} />
        <Button size="sm" onClick={() => addToast("success", "AI preferences saved")}>Save Preferences</Button>
      </CardContent>
    </Card>
  );
}

function NotificationsSection() {
  const addToast = useToastStore((s) => s.addToast);
  const [genDone, setGenDone] = useState(true);
  const [scheduleReminder, setScheduleReminder] = useState(true);
  const [assetSaved, setAssetSaved] = useState(false);

  return (
    <Card>
      <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Toggle label="Generation completed" checked={genDone} onChange={setGenDone} />
        <Toggle label="Schedule reminder (1 hour before publish)" checked={scheduleReminder} onChange={setScheduleReminder} />
        <Toggle label="Asset saved to library" checked={assetSaved} onChange={setAssetSaved} />
        <Button size="sm" onClick={() => addToast("success", "Notification settings saved")}>Save</Button>
      </CardContent>
    </Card>
  );
}

const platforms = [
  { name: "Instagram", connected: true },
  { name: "LinkedIn", connected: true },
  { name: "TikTok", connected: false },
  { name: "Facebook", connected: false },
  { name: "X / Twitter", connected: false },
];

function ConnectedSection() {
  const addToast = useToastStore((s) => s.addToast);
  const [accounts, setAccounts] = useState(platforms);

  function toggle(index: number) {
    setAccounts((prev) => prev.map((a, i) => (i === index ? { ...a, connected: !a.connected } : a)));
    const acc = accounts[index];
    addToast("success", acc.connected ? `${acc.name} disconnected` : `${acc.name} connected`);
  }

  return (
    <Card>
      <CardHeader><CardTitle>Connected Accounts</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {accounts.map((acc, i) => (
          <div key={acc.name} className="flex items-center justify-between rounded-control border bg-surface-muted px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated text-xs font-semibold text-text-primary">{acc.name[0]}</div>
              <span className="text-sm text-text-primary">{acc.name}</span>
            </div>
            <Button variant={acc.connected ? "ghost" : "secondary"} size="sm" onClick={() => toggle(i)}>
              {acc.connected ? "Disconnect" : "Connect"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DangerSection() {
  const addToast = useToastStore((s) => s.addToast);

  return (
    <Card className="border-error/30">
      <CardHeader><CardTitle className="text-error">Danger Zone</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Reset all data</p>
            <p className="text-xs text-text-muted">Clear all campaigns, assets, and scheduled posts. This cannot be undone.</p>
          </div>
          <Button variant="ghost" size="sm" className="text-error hover:bg-error/10" onClick={() => addToast("info", "Reset blocked in demo mode")}>Reset Data</Button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Delete workspace</p>
            <p className="text-xs text-text-muted">Permanently delete this workspace and all associated data.</p>
          </div>
          <Button variant="ghost" size="sm" className="text-error hover:bg-error/10" onClick={() => addToast("info", "Delete blocked in demo mode")}>Delete Workspace</Button>
        </div>
      </CardContent>
    </Card>
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-control border bg-surface-muted px-4 py-3">
      <span className="text-sm text-text-primary">{label}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${checked ? "bg-primary" : "bg-border-strong"}`}>
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </label>
  );
}
