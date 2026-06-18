import { createServiceClient } from "@/lib/supabase/service";

const BUCKET_ID = "assets";

/**
 * Ensure the assets bucket exists and is public.
 * Called automatically before first upload.
 */
async function ensureBucketExists(): Promise<void> {
  const supabase = createServiceClient();
  
  // Check if bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.id === BUCKET_ID);
  
  if (!exists) {
    console.log(`[Storage] Creating bucket: ${BUCKET_ID}`);
    const { error } = await supabase.storage.createBucket(BUCKET_ID, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
    });
    
    if (error) {
      console.error(`[Storage] Failed to create bucket:`, error);
      throw new Error(`Failed to create storage bucket: ${error.message}`);
    }
    console.log(`[Storage] Bucket created successfully`);
  }
}

/**
 * Upload a buffer/file to Supabase Storage and return the public URL.
 * Uses service role to bypass RLS (caller must verify auth separately).
 */
export async function uploadToStorage(
  path: string,
  data: Buffer | Uint8Array | Blob,
  contentType: string,
): Promise<string> {
  // Validate environment
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[Storage] SUPABASE_SERVICE_ROLE_KEY missing - storage upload will fail");
    throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  }

  const supabase = createServiceClient();

  // Ensure bucket exists (auto-create if needed)
  await ensureBucketExists();

  console.log(`[Storage] Uploading to bucket: ${BUCKET_ID}, path: ${path}, contentType: ${contentType}, size: ${Buffer.from(data).length} bytes`);

  const { error } = await supabase.storage
    .from(BUCKET_ID)
    .upload(path, data, {
      contentType,
      upsert: true,
      cacheControl: "3600",
    });

  if (error) {
    console.error(`[Storage] Upload failed:`, error);
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_ID)
    .getPublicUrl(path);

  console.log(`[Storage] Upload success, public URL: ${urlData.publicUrl}`);
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
  console.log(`[Storage] Fetching remote image: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`[Storage] Failed to fetch image: ${response.status} ${response.statusText}`);
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") ?? "image/png";
  
  console.log(`[Storage] Fetched image: ${buffer.byteLength} bytes, contentType: ${contentType}`);

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
