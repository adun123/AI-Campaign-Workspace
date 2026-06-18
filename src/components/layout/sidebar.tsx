"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, FolderOpen, ImageIcon, LayoutDashboard, LayoutGrid, LogOut, Palette, Settings, Sparkles, TrendingUp, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { logout } from "@/services/auth.service";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: FolderOpen },
  { href: "/workspace", label: "Campaign Workspace", icon: Sparkles },
  { href: "/trends", label: "Trend Discovery", icon: TrendingUp },
  { href: "/content-studio", label: "Templates", icon: WandSparkles },
  { href: "/assets", label: "Asset Library", icon: ImageIcon },
  { href: "/scheduler", label: "Scheduler", icon: CalendarDays },
  { href: "/brand-kit", label: "Brand Kit", icon: Palette },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  async function handleLogout() {
    await logout();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <aside className={cn("hidden border-r bg-surface/82 backdrop-blur-xl transition-all duration-300 lg:flex lg:min-h-screen lg:flex-col", sidebarCollapsed ? "lg:w-20" : "lg:w-[var(--sidebar-width)]")}>
      <div className={cn("flex border-b p-4", sidebarCollapsed ? "flex-col items-center justify-center gap-3 px-3" : "items-center justify-between")}>
        <Link href="/workspace" className={cn("flex items-center gap-3 text-left", sidebarCollapsed ? "justify-center" : "")} aria-label="Open Campaign Workspace">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-glow"><LayoutGrid className="h-5 w-5" /></div>
          {!sidebarCollapsed ? <div><p className="text-sm font-semibold text-text-primary">AI Campaign</p><p className="text-xs text-text-muted">Workspace</p></div> : null}
        </Link>
        {sidebarCollapsed ? (
          <Button className="h-9 w-9 px-0" variant="ghost" size="sm" onClick={toggleSidebar} aria-label="Expand sidebar">
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={toggleSidebar} aria-label="Collapse sidebar"><ChevronLeft className="h-4 w-4" /></Button>
        )}
      </div>
      <nav className="flex-1 space-y-1.5 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} aria-label={sidebarCollapsed ? item.label : undefined} title={sidebarCollapsed ? item.label : undefined} className={cn("flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-sm transition", isActive ? "bg-primary/12 text-text-primary" : "text-text-muted hover:bg-surface-elevated hover:text-text-primary", sidebarCollapsed ? "justify-center" : "justify-start")}>
              <item.icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>
      {!sidebarCollapsed ? (
        <div className="space-y-2 p-4">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-sm text-text-muted transition hover:bg-error/10 hover:text-error">
            <LogOut className="h-4 w-4" /> Logout
          </button>
          <div className="rounded-card border bg-surface-muted p-4">
            <Badge tone="accent">Studio plan</Badge>
            <p className="mt-3 text-sm font-medium text-text-primary">Backend-ready mocks</p>
            <p className="mt-1 text-xs leading-5 text-text-muted">Services are separated for future API replacement.</p>
          </div>
        </div>
      ) : (
        <div className="p-3">
          <button onClick={handleLogout} className="flex w-full items-center justify-center rounded-control px-3 py-2.5 text-text-muted transition hover:bg-error/10 hover:text-error" title="Logout" aria-label="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </aside>
  );
}
