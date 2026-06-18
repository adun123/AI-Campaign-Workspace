import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/get-workspace-id";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = await createClient();

  // Verify ownership via join
  const { data: post, error: fetchError } = await supabase
    .from("scheduled_posts")
    .select("id, campaigns!inner(workspace_id)")
    .eq("id", id)
    .eq("campaigns.workspace_id", workspaceId)
    .single();

  if (fetchError || !post) {
    return NextResponse.json({ error: "Scheduled post not found" }, { status: 404 });
  }

  // Delete by id
  const { error } = await supabase
    .from("scheduled_posts")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = await createClient();

  // Verify ownership via join
  const { data: existing, error: fetchError } = await supabase
    .from("scheduled_posts")
    .select("id, campaigns!inner(workspace_id)")
    .eq("id", id)
    .eq("campaigns.workspace_id", workspaceId)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Scheduled post not found" }, { status: 404 });
  }

  const body = await request.json();
  const { channel, publish_at, status } = body;

  // Build update object with only provided fields
  const updates: Record<string, unknown> = {};
  if (channel !== undefined) updates.channel = channel;
  if (publish_at !== undefined) updates.publish_at = publish_at;
  if (status !== undefined) updates.status = status;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("scheduled_posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
