import { createClient } from "@/lib/supabase/server";
import { getWorkspaceId } from "@/lib/get-workspace-id";
import { deleteFromStorage, getStoragePath } from "@/lib/supabase/storage";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = await createClient();

  // Fetch the asset first to get its preview URL for storage cleanup
  const { data: asset } = await supabase
    .from("assets")
    .select("preview, campaigns!inner(workspace_id)")
    .eq("id", id)
    .eq("campaigns.workspace_id", workspaceId)
    .single();

  if (!asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  // Delete the asset from DB
  const { error } = await supabase
    .from("assets")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Clean up storage file if the preview is a Supabase Storage URL
  if (asset.preview) {
    const storagePath = getStoragePath(asset.preview);
    if (storagePath) {
      try {
        await deleteFromStorage(storagePath);
      } catch {
        // Non-fatal: storage cleanup failure shouldn't block DB delete
        console.warn(`[Storage] Failed to delete: ${storagePath}`);
      }
    }
  }

  return NextResponse.json({ success: true });
}
