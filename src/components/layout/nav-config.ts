import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Megaphone,
  Sparkles,
  Library,
  CalendarDays,
  Palette,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Highlight as the primary surface (the workspace). */
  primary?: boolean;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Content Studio", href: "/studio", icon: Sparkles, primary: true },
  { label: "Asset Library", href: "/assets", icon: Library },
  { label: "Scheduler", href: "/scheduler", icon: CalendarDays },
  { label: "Brand Kit", href: "/brand-kit", icon: Palette },
];

export const SECONDARY_NAV: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
];
