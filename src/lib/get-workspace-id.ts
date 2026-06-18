import { createClient } from "@/lib/supabase/server";

/**
 * Ambil workspace_id milik user yang sedang login.
 * Return null jika user belum login atau belum punya workspace.
 */
export async function getWorkspaceId(): Promise<string | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  return data?.id ?? null;
}
