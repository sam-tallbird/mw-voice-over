-- ======================================================================
--  MOONWHALE VOICE-OVER - STORAGE INTEGRATION UPDATE
--  ─────────────────────────────────────────────────────────────────────
--  Run this SQL in Supabase SQL Editor to add storage support
-- ======================================================================

-- 1. Add storage-related columns to generations table
ALTER TABLE generations ADD COLUMN IF NOT EXISTS storage_path text;
ALTER TABLE generations ADD COLUMN IF NOT EXISTS file_size_bytes integer;

-- Update the audio_url column comment for clarity
COMMENT ON COLUMN generations.audio_url IS 'Public URL from Supabase Storage';
COMMENT ON COLUMN generations.storage_path IS 'Internal storage path in Supabase Storage';
COMMENT ON COLUMN generations.file_size_bytes IS 'Size of the audio file in bytes';

-- 2. Create storage bucket (if not created via Dashboard)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-overs', 'voice-overs', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Set up Storage Policies (Row Level Security)

-- Allow users to upload their own voice-overs
CREATE POLICY "Users can upload own voice files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'voice-overs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own voice-overs
CREATE POLICY "Users can view own voice files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'voice-overs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own voice-overs
CREATE POLICY "Users can delete own voice files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'voice-overs' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Service role can manage all files (for admin/cleanup)
CREATE POLICY "Service role full access to voice files" ON storage.objects
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 4. Update indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generations_storage_path ON generations(storage_path);
CREATE INDEX IF NOT EXISTS idx_generations_audio_url ON generations(audio_url);

-- 5. Add helpful functions for storage management

-- Function to get user's voice-over history
CREATE OR REPLACE FUNCTION get_user_voice_history(user_id uuid, limit_count integer DEFAULT 50)
RETURNS TABLE(
  id uuid,
  voice_name text,
  voice_arabic text,
  input_text text,
  audio_url text,
  duration_seconds integer,
  file_size_bytes integer,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    v.display_name,
    v.arabic_name,
    g.input_text,
    g.audio_url,
    g.duration_seconds,
    g.file_size_bytes,
    g.created_at
  FROM generations g
  JOIN voices v ON g.voice_id = v.id
  WHERE g.user_id = get_user_voice_history.user_id
    AND g.status = 'completed'
    AND g.audio_url IS NOT NULL
  ORDER BY g.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate total storage usage per user
CREATE OR REPLACE FUNCTION get_user_storage_usage(user_id uuid)
RETURNS TABLE(
  total_files integer,
  total_size_bytes bigint,
  total_size_mb numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as total_files,
    COALESCE(SUM(g.file_size_bytes), 0)::bigint as total_size_bytes,
    ROUND(COALESCE(SUM(g.file_size_bytes), 0) / 1024.0 / 1024.0, 2) as total_size_mb
  FROM generations g
  WHERE g.user_id = get_user_storage_usage.user_id
    AND g.status = 'completed'
    AND g.file_size_bytes IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Verify the setup
DO $$
BEGIN
  -- Check if bucket exists
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'voice-overs') THEN
    RAISE NOTICE 'Storage bucket "voice-overs" created successfully';
  ELSE
    RAISE WARNING 'Storage bucket "voice-overs" was not created. Please create it via Dashboard.';
  END IF;
  
  -- Check if columns were added
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'generations' AND column_name = 'storage_path') THEN
    RAISE NOTICE 'Storage columns added to generations table successfully';
  ELSE
    RAISE WARNING 'Failed to add storage columns to generations table';
  END IF;
  
  RAISE NOTICE 'Storage integration setup completed!';
END $$; 