-- ============================================================
-- Supabase Storage Setup
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create the storage bucket (public so images can be accessed via URL)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assets', 
  'assets', 
  true, 
  10485760, 
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

-- 2. Policy: Anyone can read files (public assets)
DROP POLICY IF EXISTS "PublicReadAccess" ON storage.objects;
CREATE POLICY "PublicReadAccess"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'assets');

-- 3. Policy: Anyone can insert files (upload)
DROP POLICY IF EXISTS "PublicInsertAccess" ON storage.objects;
CREATE POLICY "PublicInsertAccess"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'assets');

-- 4. Policy: Anyone can update files
DROP POLICY IF EXISTS "PublicUpdateAccess" ON storage.objects;
CREATE POLICY "PublicUpdateAccess"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'assets');

-- 5. Policy: Anyone can delete files
DROP POLICY IF EXISTS "PublicDeleteAccess" ON storage.objects;
CREATE POLICY "PublicDeleteAccess"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'assets');