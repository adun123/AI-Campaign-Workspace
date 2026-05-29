"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessionQuery } from "@/hooks/use-workspace-data";

export function Topbar() {
  const sessionQuery = useSessionQuery();
  const user = sessionQuery.data?.user;

  return (
    <header className="sticky top-0 z-20 border-b bg-background/72 px-4 py-3 backdrop-blur-xl lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">K</div>
        </div>
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input className="pl-9" placeholder="Search campaigns, assets, prompts..." />
        </div>
        <Button variant="ghost" size="sm"><Bell className="h-4 w-4" /></Button>
        <div className="flex items-center gap-3 rounded-full border bg-surface px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">{user?.avatarInitials ?? "AI"}</div>
          <div className="hidden pr-2 sm:block">
            <p className="text-xs font-medium text-text-primary">{user?.name ?? "Loading"}</p>
            <p className="text-xs text-text-muted">{sessionQuery.data?.workspace.name ?? "Workspace"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
