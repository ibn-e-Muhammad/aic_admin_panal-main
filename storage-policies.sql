-- Storage policies for the 'storage' bucket
-- Run these commands in your Supabase SQL Editor

-- 1. Enable public access for reading files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'storage');

-- 2. Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'storage' AND auth.role() = 'authenticated');

-- 3. Allow authenticated users to update files
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
USING (bucket_id = 'storage' AND auth.role() = 'authenticated');

-- 4. Allow authenticated users to delete files
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'storage' AND auth.role() = 'authenticated');

-- Alternative: If you want to allow anonymous uploads (less secure)
-- Uncomment the following policy instead of the authenticated ones above:

-- CREATE POLICY "Allow anonymous uploads"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'storage');

-- CREATE POLICY "Allow anonymous updates"
-- ON storage.objects FOR UPDATE
-- USING (bucket_id = 'storage');

-- CREATE POLICY "Allow anonymous deletes"
-- ON storage.objects FOR DELETE
-- USING (bucket_id = 'storage');