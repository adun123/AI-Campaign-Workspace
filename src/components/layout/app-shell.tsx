"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { userService } from "@/services";
import { queryKeys } from "@/services/query-keys";

/**
 * Top-level frame: sidebar + topbar + main outlet.
 *
 * The topbar is suppressed on routes that own the full chrome themselves
 * (currently the Campaign Workspace), so the workspace header is the only
 * sticky element at the top of the viewport.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ownsChrome = /^\/campaigns\/[^/]+\/workspace/.test(pathname ?? "");

  const { data: user } = useQuery({
    queryKey: queryKeys.me,
    queryFn: () => userService.me(),
  });

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          {!ownsChrome ? <Topbar user={user} title={titleForPath(pathname ?? "")} /> : null}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}

function titleForPath(path: string): string {
  if (path.startsWith("/campaigns")) return "Campaigns";
  if (path.startsWith("/dashboard")) return "Dashboard";
  if (path.startsWith("/studio")) return "Content Studio";
  if (path.startsWith("/assets")) return "Asset Library";
  if (path.startsWith("/scheduler")) return "Scheduler";
  if (path.startsWith("/brand-kit")) return "Brand Kit";
  if (path.startsWith("/settings")) return "Settings";
  return "Campaign Workspace";
}
