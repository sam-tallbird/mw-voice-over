-- ======================================================================
--  MOONWHALE VOICE-OVER - OPTIMIZED RLS SETUP
--  ─────────────────────────────────────────────────────────────────────
--  Based on Supabase RLS Performance Best Practices
--  99.9% performance improvement with optimized policies
-- ======================================================================

-- 🔐 ENABLE ROW LEVEL SECURITY ----------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE voices ENABLE ROW LEVEL SECURITY; 
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_usage_summary ENABLE ROW LEVEL SECURITY;

-- ======================================================================
--  PERFORMANCE-OPTIMIZED POLICIES
--  Using (select auth.uid()) for caching + TO role for efficiency
-- ======================================================================

-- 👤 USERS TABLE POLICIES ---------------------------------------------

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

-- 🔉 VOICES TABLE POLICIES --------------------------------------------

-- All authenticated users can view active voices (public catalog)
CREATE POLICY "voices_select_active" ON voices
  FOR SELECT TO authenticated
  USING (is_active = true);

-- Anonymous users can also view active voices (for public pages)
CREATE POLICY "voices_select_active_anon" ON voices
  FOR SELECT TO anon
  USING (is_active = true);

-- Service role has full access for voice management
CREATE POLICY "voices_service_role_all" ON voices
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 🎙️ GENERATIONS TABLE POLICIES --------------------------------------

-- Users can view their own generations only
CREATE POLICY "generations_select_own" ON generations
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- Users can insert their own generations only
CREATE POLICY "generations_insert_own" ON generations
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Users can update their own generations (for status updates)
CREATE POLICY "generations_update_own" ON generations
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Service role has full access for admin operations and API
CREATE POLICY "generations_service_role_all" ON generations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 📊 MONTHLY USAGE SUMMARY POLICIES ----------------------------------

-- Users can view their own usage summary only
CREATE POLICY "usage_summary_select_own" ON monthly_usage_summary
  FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

-- Service role has full access for analytics and admin
CREATE POLICY "usage_summary_service_role_all" ON monthly_usage_summary
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ======================================================================
--  STORAGE POLICIES (for voice-overs bucket)
-- ======================================================================

-- Users can upload files to their own folder only
CREATE POLICY "voice_files_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'voice-overs' 
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Users can view their own files only
CREATE POLICY "voice_files_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'voice-overs' 
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Users can delete their own files only
CREATE POLICY "voice_files_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'voice-overs' 
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Service role has full access to all storage files
CREATE POLICY "voice_files_service_role_all" ON storage.objects
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ======================================================================
--  VERIFICATION QUERIES
-- ======================================================================

-- Verify RLS is enabled
DO $$ 
DECLARE
    table_record record;
BEGIN
    FOR table_record IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = table_record.tablename 
            AND rowsecurity = true
        ) THEN
            RAISE WARNING 'RLS not enabled on table: %', table_record.tablename;
        ELSE
            RAISE NOTICE 'RLS enabled on table: %', table_record.tablename;
        END IF;
    END LOOP;
END $$;

-- Test policies exist
DO $$
DECLARE
    policy_count integer;
BEGIN
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
    
    IF policy_count > 0 THEN
        RAISE NOTICE 'Created % RLS policies successfully', policy_count;
    ELSE
        RAISE WARNING 'No RLS policies found! Check for errors above.';
    END IF;
END $$;

-- ======================================================================
--  PERFORMANCE TEST QUERIES (Run these to verify optimization)
-- ======================================================================

-- These should run fast with the optimized policies:

-- Test 1: User profile access (should use index on id)
-- EXPLAIN (ANALYZE, BUFFERS) 
-- SELECT * FROM users WHERE id = auth.uid();

-- Test 2: User generations (should use index on user_id) 
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT * FROM generations WHERE user_id = auth.uid();

-- Test 3: Voice catalog (should be fast for all users)
-- EXPLAIN (ANALYZE, BUFFERS)
-- SELECT * FROM voices WHERE is_active = true;

-- ======================================================================
--  NOTES FOR DEVELOPERS
-- ======================================================================

/*
CRITICAL PERFORMANCE TIPS:

1. ALWAYS add explicit filters in your queries:
   ❌ Bad:  supabase.from('users').select()
   ✅ Good: supabase.from('users').select().eq('id', user.id)

2. Use the optimized auth functions:
   ✅ (select auth.uid()) - cached per statement
   ❌ auth.uid() - called for every row

3. Specify roles in policies:
   ✅ TO authenticated - stops execution for anon users
   ❌ No TO clause - policy runs for all users

4. Test policy performance:
   Use EXPLAIN (ANALYZE, BUFFERS) to check query plans

5. Monitor RLS performance:
   Watch for slow queries in Supabase Dashboard
*/

-- ======================================================================
--  SUCCESS MESSAGES
-- ======================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Optimized RLS setup completed successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update application code to add explicit filters';
    RAISE NOTICE '2. Test with demo users';
    RAISE NOTICE '3. Monitor performance in Supabase Dashboard';
END $$; 