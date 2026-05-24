import * as React from "react";

/**
 * Pass-through layout. The Campaign Workspace renders its own header.
 * The AppShell topbar is suppressed for workspace routes (see app-shell.tsx).
 */
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
