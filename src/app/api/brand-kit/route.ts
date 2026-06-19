import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/get-workspace-id";
import { NextResponse } from "next/server";

export async function GET() {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand_kits")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const input = {
    workspace_id: workspaceId,
    name: body.name,
    voice: body.voice,
    colors: body.colors ?? [],
    logo_url: body.logo_url,
    guardrails: body.guardrails ?? [],
    logo_enabled: body.logo_enabled ?? false,
    logo_position: body.logo_position ?? "bottom-right",
    logo_size_percent: body.logo_size_percent ?? 15,
    voice_enabled: body.voice_enabled ?? true,
    colors_enabled: body.colors_enabled ?? true,
    guardrails_enabled: body.guardrails_enabled ?? true,
    typography: body.typography,
    typography_enabled: body.typography_enabled ?? false,
    brand_values: body.brand_values ?? [],
    brand_values_enabled: body.brand_values_enabled ?? false,
  };

  if (!input.name) return NextResponse.json({ error: "Nama brand kit wajib diisi." }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand_kits")
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error("[BrandKit POST] DB error:", error);
    return NextResponse.json({ error: error.message, details: error }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
