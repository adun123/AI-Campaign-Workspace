import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/get-workspace-id";
import { NextResponse } from "next/server";

export async function GET() {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();

  const [{ count: assetCount }, { count: scheduledCount }, { count: campaignCount }] = await Promise.all([
    supabase
      .from("assets")
      .select("id", { count: "exact", head: true })
      .in("campaign_id", supabase.from("campaigns").select("id").eq("workspace_id", workspaceId)),
    supabase
      .from("scheduled_posts")
      .select("id", { count: "exact", head: true })
      .in("campaign_id", supabase.from("campaigns").select("id").eq("workspace_id", workspaceId))
      .eq("status", "scheduled"),
    supabase
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
  ]);

  const assets = assetCount ?? 0;
  const scheduled = scheduledCount ?? 0;
  const readiness = Math.min(100, Math.min(assets, 5) * 12 + Math.min(scheduled, 3) * 10 + 6);

  return NextResponse.json({
    metrics: [
      { label: "Assets", value: String(assets) },
      { label: "Scheduled", value: String(scheduled) },
      { label: "Campaigns", value: String(campaignCount ?? 0) },
      { label: "Readiness", value: `${readiness}%` },
    ],
  });
}
