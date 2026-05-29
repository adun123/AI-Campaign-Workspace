"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ImageIcon, LayoutDashboard, Palette, Settings, Sparkles, TrendingUp, WandSparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dash", icon: LayoutDashboard },
  { href: "/workspace", label: "Work", icon: Sparkles },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { href: "/content-studio", label: "Templates", icon: WandSparkles },
  { href: "/assets", label: "Assets", icon: ImageIcon },
  { href: "/scheduler", label: "Plan", icon: CalendarDays },
  { href: "/brand-kit", label: "Brand", icon: Palette },
  { href: "/settings", label: "Set", icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-30 flex gap-1 overflow-x-auto rounded-card border bg-surface/92 p-2 shadow-soft backdrop-blur-xl lg:hidden">
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={cn("flex min-w-16 flex-col items-center gap-1 rounded-control px-2 py-2 text-xs transition", pathname === item.href ? "bg-primary/14 text-text-primary" : "text-text-muted")}>
          <item.icon className="h-4 w-4" /> {item.label}
        </Link>
      ))}
    </nav>
  );
}
