-- ======================================================================
--  MOONWHALE VOICE-OVER - CLEAN RLS SETUP (No syntax errors)
--  ─────────────────────────────────────────────────────────────────────
--  Simple, clean version that definitely works
-- ======================================================================

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE voices ENABLE ROW LEVEL SECURITY; 
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_usage_summary ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile only
CREATE POLICY "users_select_own" ON users
  FOR SELECT TO authenticated 
  USING ((select auth.uid()) = id);

-- Users can update their own profile only  
CREATE POLICY "users_update_own" ON users
  FOR UPDATE TO authenticated 
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Service role has full access for admin operations
CREATE POLICY "users_service_role_all" ON users
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- All authenticated users can view active voices
CREATE POLICY "voices_select_active" ON voices
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Anonymous users can also view active voices
CREATE POLICY "voices_select_active_anon" ON voices
  FOR SELECT TO anon
  USING (is_active = true);

-- Service role has full access for voice management
CREATE POLICY "voices_service_role_all" ON voices
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Users can view their own generations only
CREATE POLICY "generations_select_own" ON generations
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- Users can insert their own generations only
CREATE POLICY "generations_insert_own" ON generations
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Users can update their own generations
CREATE POLICY "generations_update_own" ON generations
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Service role has full access for admin operations and API
CREATE POLICY "generations_service_role_all" ON generations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Users can view their own usage summary only
CREATE POLICY "usage_summary_select_own" ON monthly_usage_summary
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- Service role has full access for analytics and admin
CREATE POLICY "usage_summary_service_role_all" ON monthly_usage_summary
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Storage policies for voice-overs bucket
CREATE POLICY "voice_files_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'voice-overs' 
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

CREATE POLICY "voice_files_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'voice-overs' 
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

CREATE POLICY "voice_files_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'voice-overs' 
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

CREATE POLICY "voice_files_service_role_all" ON storage.objects
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Verification queries (optional - run separately if needed)
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- SELECT COUNT(*) as policy_count FROM pg_policies WHERE schemaname = 'public'; 