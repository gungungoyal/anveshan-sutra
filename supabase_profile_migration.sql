-- ============================================
-- DRIVYA.AI - PROFILE SETTINGS MIGRATION
-- Run this on your Supabase SQL Editor
-- ============================================

-- Add new columns to user_profiles table for extended profile functionality
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS organization_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"notifications": true, "theme": "system", "newsletter": false}'::jsonb;

-- Create storage bucket for avatars (if not exists)
-- Note: This needs to be done via Supabase Dashboard > Storage > Create Bucket
-- Bucket name: avatars
-- Public bucket: Yes (for public avatar URLs)

-- Create policy for avatar uploads (run after creating bucket)
-- Allow authenticated users to upload their own avatars
-- INSERT policy for avatars bucket:
-- CREATE POLICY "Users can upload own avatar" ON storage.objects
--     FOR INSERT WITH CHECK (
--         bucket_id = 'avatars' AND
--         auth.uid()::text = (storage.foldername(name))[1]
--     );

-- Allow public read access to avatars
-- SELECT policy for avatars bucket:
-- CREATE POLICY "Avatars are publicly accessible" ON storage.objects
--     FOR SELECT USING (bucket_id = 'avatars');

-- Update existing users with default preferences if null
UPDATE user_profiles
SET preferences = '{"notifications": true, "theme": "system", "newsletter": false}'::jsonb
WHERE preferences IS NULL;
