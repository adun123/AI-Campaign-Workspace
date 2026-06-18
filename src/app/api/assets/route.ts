import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/get-workspace-id";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("campaign_id");
  const status = searchParams.get("status") ?? "saved";

  const supabase = await createClient();
  let query = supabase
    .from("assets")
    .select("*, campaigns!inner(workspace_id)")
    .eq("campaigns.workspace_id", workspaceId)
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (campaignId) query = query.eq("campaign_id", campaignId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { campaign_id, title, kind, prompt, preview, channel, status } = body;

  if (!campaign_id || !title || !kind) {
    return NextResponse.json({ error: "campaign_id, title, dan kind wajib diisi." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .insert({ campaign_id, title, kind, prompt, preview, channel, status: status ?? "draft" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
