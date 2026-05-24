"use client";

import * as React from "react";
import { Search, Plus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initialsOf } from "@/lib/format";

interface TopbarProps {
  title?: string;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
  user?: { name: string; email?: string };
}

export function Topbar({ title, breadcrumbs, actions, user }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {breadcrumbs ?? (
          <h2 className="truncate text-sm font-medium text-foreground">{title ?? ""}</h2>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" className="hidden md:inline-flex">
          <Search className="h-3.5 w-3.5" />
          <span className="text-muted-foreground">Search</span>
          <kbd className="ml-2 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </Button>

        {actions}

        <Button size="sm">
          <Plus className="h-4 w-4" />
          New
        </Button>

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>

        {user ? (
          <Avatar>
            <AvatarFallback>{initialsOf(user.name)}</AvatarFallback>
          </Avatar>
        ) : null}
      </div>
    </header>
  );
}
