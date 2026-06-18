import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/get-workspace-id";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = await createClient();

  // First get campaign IDs for this workspace
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id")
    .eq("workspace_id", workspaceId);

  const campaignIds = (campaigns ?? []).map((c) => c.id);
  if (campaignIds.length === 0) return NextResponse.json({ error: "No campaigns" }, { status: 404 });

  // Delete generation_outputs first (FK constraint)
  await supabase.from("generation_outputs").delete().eq("generation_id", id);

  const { error } = await supabase
    .from("ai_generations")
    .delete()
    .eq("id", id)
    .in("campaign_id", campaignIds);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
