import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/get-workspace-id";
import { NextResponse } from "next/server";

export async function GET() {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();

  // Fetch all data using joins instead of .in() with subqueries
  const [
    { count: assetCount, error: assetError },
    { count: scheduledCount, error: scheduledError },
    { count: campaignCount, error: campaignError },
    { count: generationCount, error: generationError },
    { data: recentAssets, error: assetsError },
    { data: recentGenerations, error: generationsError },
    { data: channelBreakdown, error: channelError },
  ] = await Promise.all([
    // Count assets
    supabase
      .from("assets")
      .select("id, campaigns!inner(workspace_id)", { count: "exact", head: true })
      .eq("campaigns.workspace_id", workspaceId),
    // Count scheduled posts
    supabase
      .from("scheduled_posts")
      .select("id, campaigns!inner(workspace_id)", { count: "exact", head: true })
      .eq("campaigns.workspace_id", workspaceId)
      .eq("status", "scheduled"),
    // Count campaigns
    supabase
      .from("campaigns")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    // Count generations
    supabase
      .from("ai_generations")
      .select("id, campaigns!inner(workspace_id)", { count: "exact", head: true })
      .eq("campaigns.workspace_id", workspaceId),
    // Recent assets (last 5)
    supabase
      .from("assets")
      .select("id, title, kind, channel, preview, created_at, campaigns!inner(workspace_id)")
      .eq("campaigns.workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(5),
    // Recent generations (last 10)
    supabase
      .from("ai_generations")
      .select("id, mode, prompt, status, created_at, campaigns!inner(workspace_id)")
      .eq("campaigns.workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(10),
    // Channel breakdown
    supabase
      .from("assets")
      .select("channel, campaigns!inner(workspace_id)")
      .eq("campaigns.workspace_id", workspaceId),
  ]);

  if (assetError || scheduledError || campaignError || generationError || assetsError || generationsError || channelError) {
    console.error("Dashboard summary errors:", { assetError, scheduledError, campaignError, generationError, assetsError, generationsError, channelError });
    return NextResponse.json({ error: "Failed to fetch dashboard summary" }, { status: 500 });
  }

  const assets = assetCount ?? 0;
  const scheduled = scheduledCount ?? 0;
  const campaigns = campaignCount ?? 0;
  const generations = generationCount ?? 0;

  // Calculate channel distribution
  const channelCounts: Record<string, number> = {};
  if (channelBreakdown) {
    for (const asset of channelBreakdown) {
      const ch = asset.channel ?? "Unknown";
      channelCounts[ch] = (channelCounts[ch] ?? 0) + 1;
    }
  }

  // Estimate cost: text-to-image $0.003, image-to-image $0.04
  let estimatedCost = 0;
  if (recentGenerations) {
    for (const gen of recentGenerations) {
      if (gen.mode === "text-to-image") estimatedCost += 0.003;
      else if (gen.mode === "image-to-image") estimatedCost += 0.04;
    }
  }

  const readiness = Math.min(100, Math.min(assets, 5) * 12 + Math.min(scheduled, 3) * 10 + 6);

  return NextResponse.json({
    metrics: [
      { label: "Assets", value: String(assets) },
      { label: "Generations", value: String(generations) },
      { label: "Scheduled", value: String(scheduled) },
      { label: "Campaigns", value: String(campaigns) },
    ],
    readiness,
    estimatedCost: estimatedCost.toFixed(3),
    channelBreakdown: channelCounts,
    recentAssets: recentAssets ?? [],
    recentGenerations: recentGenerations ?? [],
  });
}
