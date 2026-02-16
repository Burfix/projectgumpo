-- Create storage bucket for activity photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'activity-photos',
  'activity-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- RLS Policies for activity-photos bucket
-- Teachers can upload photos
CREATE POLICY "Teachers can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'activity-photos' AND
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('TEACHER', 'ADMIN', 'PRINCIPAL', 'SUPER_ADMIN')
  )
);

-- Teachers and admins can update their own photos
CREATE POLICY "Teachers can update own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'activity-photos' AND
  auth.uid() = owner
);

-- Teachers and admins can delete their own photos
CREATE POLICY "Teachers can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'activity-photos' AND
  auth.uid() = owner
);

-- Everyone authenticated can view photos (parents can see their children's photos)
CREATE POLICY "Authenticated users can view photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'activity-photos');

-- Public read access for photos (optional - if you want photos viewable without auth)
-- Uncomment if needed:
-- CREATE POLICY "Public can view photos"
-- ON storage.objects FOR SELECT
-- TO public
-- USING (bucket_id = 'activity-photos');
