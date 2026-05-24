"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ChevronsLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/stores/ui.store";
import { PRIMARY_NAV, SECONDARY_NAV, type NavItem } from "./nav-config";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex h-9 items-center gap-3 rounded-md px-2.5 text-sm transition-colors",
        active
          ? "bg-surface-2 text-foreground"
          : "text-muted-foreground hover:bg-surface-2/60 hover:text-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span
        className={cn(
          "truncate transition-opacity",
          collapsed ? "pointer-events-none opacity-0" : "opacity-100",
        )}
      >
        {item.label}
      </span>
      {active ? (
        <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary" aria-hidden />
      ) : null}
    </Link>
  );
}

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const setCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  return (
    <aside
      className={cn(
        "sticky top-0 z-30 flex h-screen shrink-0 flex-col border-r border-border bg-surface/60 backdrop-blur transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-[248px]",
      )}
      aria-label="Primary"
    >
      <div className="flex h-14 items-center justify-between gap-2 px-3">
        <Link href="/" className="flex items-center gap-2 px-1">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <span
            className={cn(
              "text-sm font-semibold tracking-tight transition-opacity",
              collapsed ? "pointer-events-none opacity-0" : "opacity-100",
            )}
          >
            Campaign Workspace
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden md:inline-flex"
        >
          <ChevronsLeft
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
          />
        </Button>
      </div>

      <Separator />

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3 scrollbar-thin">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <Separator />

      <div className="space-y-0.5 px-2 py-3">
        {SECONDARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </div>
    </aside>
  );
}
