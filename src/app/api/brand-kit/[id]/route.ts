import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/get-workspace-id";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  // Whitelist allowed fields (snake_case DB columns)
  const allowedFields = [
    "name", "voice", "colors", "logo_url", "guardrails",
    "logo_enabled", "logo_position", "logo_size_percent",
    "voice_enabled", "colors_enabled", "guardrails_enabled",
    "typography", "typography_enabled",
    "brand_values", "brand_values_enabled",
  ];

  const updates: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand_kits")
    .update(updates)
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase
    .from("brand_kits")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspaceId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
