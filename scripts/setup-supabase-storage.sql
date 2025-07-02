-- Run these commands in your Supabase SQL editor to set up storage policies
-- Go to: Supabase Dashboard > SQL Editor > New query

-- 1. First, create the storage bucket (you can also do this via UI)
-- Go to Storage > Create bucket > Name: "pet-media" > Public: ON

-- 2. Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload pet media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'pet-media' 
  AND auth.role() = 'authenticated'
);

-- 4. Create policy to allow public access to view files
CREATE POLICY "Allow public access to pet media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'pet-media');

-- 5. Create policy to allow users to update their own files
CREATE POLICY "Allow users to update own pet media" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'pet-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Create policy to allow users to delete their own files
CREATE POLICY "Allow users to delete own pet media" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'pet-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Note: After running this, go to Storage > pet-media bucket > Settings 
-- Make sure "Public bucket" is enabled for public access to files 