import { createServiceClient } from "@/lib/supabase/service";

const BUCKET_ID = "assets";

/**
 * Upload a buffer/file to Supabase Storage and return the public URL.
 * Uses service role to bypass RLS (caller must verify auth separately).
 */
export async function uploadToStorage(
  path: string,
  data: Buffer | Uint8Array | Blob,
  contentType: string,
): Promise<string> {
  const supabase = createServiceClient();

  const { error } = await supabase.storage
    .from(BUCKET_ID)
    .upload(path, data, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from(BUCKET_ID)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Download a file from a URL and re-upload to Supabase Storage.
 * Used to persist fal.ai or other temporary URLs.
 */
export async function persistRemoteImage(
  url: string,
  storagePath: string,
): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") ?? "image/png";

  return uploadToStorage(storagePath, Buffer.from(buffer), contentType);
}

/**
 * Delete a file from Supabase Storage.
 * Uses service role to bypass RLS (caller must verify auth separately).
 */
export async function deleteFromStorage(path: string): Promise<void> {
  const supabase = createServiceClient();

  const { error } = await supabase.storage
    .from(BUCKET_ID)
    .remove([path]);

  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

/**
 * Extract the storage path from a Supabase public URL.
 */
export function getStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET_ID}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}
