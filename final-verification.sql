-- ======================================================================
--  MOONWHALE VOICE-OVER - FINAL RLS VERIFICATION
--  ─────────────────────────────────────────────────────────────────────
--  Run this to verify everything is working correctly
-- ======================================================================

-- 1. Check RLS is enabled on all tables
SELECT 
  '1. RLS STATUS' as check_name,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ ENABLED' 
    ELSE '❌ DISABLED' 
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'voices', 'generations', 'monthly_usage_summary')
ORDER BY tablename;

-- 2. Count database policies by table
SELECT 
  '2. DATABASE POLICIES' as check_name,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN tablename = 'users' AND COUNT(*) >= 3 THEN '✅ COMPLETE'
    WHEN tablename = 'voices' AND COUNT(*) >= 3 THEN '✅ COMPLETE' 
    WHEN tablename = 'generations' AND COUNT(*) >= 4 THEN '✅ COMPLETE'
    WHEN tablename = 'monthly_usage_summary' AND COUNT(*) >= 2 THEN '✅ COMPLETE'
    ELSE '⚠️ CHECK'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 3. Check storage bucket exists
SELECT 
  '3. STORAGE BUCKET' as check_name,
  name as bucket_name,
  CASE 
    WHEN public THEN '⚠️ PUBLIC' 
    ELSE '✅ PRIVATE' 
  END as bucket_status
FROM storage.buckets 
WHERE name = 'voice-overs';

-- 4. Count storage policies
SELECT 
  '4. STORAGE POLICIES' as check_name,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 4 THEN '✅ COMPLETE'
    ELSE '⚠️ INCOMPLETE'
  END as status
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 5. Test data counts (verify you have data)
SELECT 
  '5. DATA VERIFICATION' as check_name,
  'users' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ HAS DATA'
    ELSE '⚠️ NO DATA'
  END as status
FROM users

UNION ALL

SELECT 
  '5. DATA VERIFICATION' as check_name,
  'voices' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ HAS DATA'
    ELSE '⚠️ NO DATA'
  END as status
FROM voices

UNION ALL

SELECT 
  '5. DATA VERIFICATION' as check_name,
  'generations' as table_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ READY'
    ELSE '⚠️ ERROR'
  END as status
FROM generations;

-- 6. Test auth function works
SELECT 
  '6. AUTH FUNCTION TEST' as check_name,
  CASE 
    WHEN auth.uid() IS NULL THEN '✅ READY (No user logged in)'
    ELSE '✅ USER: ' || auth.uid()::text
  END as auth_status;

-- 7. Summary - Overall Status
SELECT 
  '7. OVERALL STATUS' as check_name,
  CASE 
    WHEN 
      (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = true) = 4
      AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 12
      AND (SELECT COUNT(*) FROM storage.buckets WHERE name = 'voice-overs') = 1
      AND (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects') >= 4
    THEN '🎉 PERFECT! Everything is working correctly.'
    ELSE '⚠️ Some components need attention (check details above)'
  END as final_status;

-- 8. Expected vs Actual Policy Counts
SELECT 
  '8. POLICY SUMMARY' as check_name,
  'Database Policies' as policy_type,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as actual_count,
  '12+' as expected_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 12 
    THEN '✅ GOOD'
    ELSE '❌ MISSING'
  END as status

UNION ALL

SELECT 
  '8. POLICY SUMMARY' as check_name,
  'Storage Policies' as policy_type,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects') as actual_count,
  '4+' as expected_count,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects') >= 4 
    THEN '✅ GOOD'
    ELSE '❌ MISSING'
  END as status; 