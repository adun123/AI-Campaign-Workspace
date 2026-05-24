import { redirect } from "next/navigation";

/**
 * The product is campaign-centric. The dashboard is a supporting surface,
 * not the entry point — we send users straight to the Campaigns hub.
 */
export default function RootPage() {
  redirect("/campaigns");
}
