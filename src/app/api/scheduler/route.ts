import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/get-workspace-id";
import { NextResponse } from "next/server";

export async function GET() {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scheduled_posts")
    .select("*, campaigns!inner(workspace_id)")
    .eq("campaigns.workspace_id", workspaceId)
    .order("publish_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { campaign_id, asset_id, channel, publish_at } = body;

  if (!campaign_id || !asset_id || !channel || !publish_at) {
    return NextResponse.json({ error: "campaign_id, asset_id, channel, dan publish_at wajib diisi." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scheduled_posts")
    .insert({ campaign_id, asset_id, channel, publish_at, status: "scheduled" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
