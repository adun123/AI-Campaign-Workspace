"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ToastContainer } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import type { ReactNode } from "react";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-grid grain min-h-screen overflow-hidden">
      <div className="relative flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="relative z-10 min-w-0 flex-1 overflow-x-hidden p-4 pb-28 lg:p-6">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
        <MobileNav />
        <ToastContainer />
      </div>
    </div>
  );
}
