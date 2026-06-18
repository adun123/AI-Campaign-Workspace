-- ============================================================
-- Supabase Storage: Asset images bucket
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create the storage bucket for asset images
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'assets');

-- 3. Allow public read access (images are served publicly)
CREATE POLICY "Public read access for assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assets');

-- 4. Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'assets');

-- 5. Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'assets');
