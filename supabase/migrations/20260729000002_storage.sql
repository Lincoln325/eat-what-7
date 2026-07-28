-- Storage bucket for restaurant images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'restaurants',
  'restaurants',
  true,                          -- public read (images served directly)
  2097152,                       -- 2MB max per file (WebP after optimization)
  ARRAY['image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read (public CDN)
CREATE POLICY "Public read restaurant images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'restaurants');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload restaurant images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'restaurants');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Authenticated delete restaurant images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'restaurants');
