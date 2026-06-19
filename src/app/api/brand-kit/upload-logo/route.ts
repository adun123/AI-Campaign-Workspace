import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/get-workspace-id";
import { uploadToStorage } from "@/lib/supabase/storage";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const brandKitId = formData.get("brand_kit_id") as string | null;

  if (!file || !brandKitId) {
    return NextResponse.json({ error: "Missing file or brand_kit_id" }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "File type not allowed. Use PNG, JPEG, SVG, or WebP." }, { status: 400 });
  }

  // Validate file size (max 5MB for logos)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1] ?? "png";
    const storagePath = `brand-kits/${workspaceId}/${brandKitId}/logo.${ext}`;

    const publicUrl = await uploadToStorage(storagePath, buffer, file.type);

    // Update brand_kits table
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from("brand_kits")
      .update({ logo_url: publicUrl })
      .eq("id", brandKitId)
      .eq("workspace_id", workspaceId);

    if (updateError) {
      console.error("[BrandKit] Failed to update logo_url:", updateError);
      return NextResponse.json({ error: "Logo uploaded but failed to update brand kit." }, { status: 500 });
    }

    return NextResponse.json({ url: publicUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[BrandKit] Logo upload error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
