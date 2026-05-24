import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { QueryProvider } from "@/components/shared/query-provider";
import { cn } from "@/lib/cn";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Campaign Workspace",
    template: "%s · Campaign Workspace",
  },
  description:
    "Campaign-centric AI marketing workflow platform for agencies, content teams, and creators.",
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("dark", GeistSans.variable, GeistMono.variable)}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
