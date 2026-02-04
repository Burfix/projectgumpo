-- ============================================================
-- DEBUG: Check Current User Setup
-- ============================================================
-- Run this to diagnose what's wrong
-- ============================================================

-- 1. Check if user profile exists and is properly configured
SELECT 
  'USER PROFILE CHECK' as check_type,
  u.id,
  u.email,
  u.name,
  u.role,
  u.school_id,
  u.status,
  CASE 
    WHEN u.school_id IS NULL THEN '❌ No school assigned'
    ELSE '✅ School assigned'
  END as school_status
FROM auth.users au
LEFT JOIN public.users u ON u.id = au.id
WHERE au.email IN ('principal@myschool.co.za', 'admin@myschool.co.za')
ORDER BY au.email;

-- 2. Check school exists
SELECT 
  'SCHOOL CHECK' as check_type,
  s.id,
  s.name,
  s.status,
  '✅ School exists' as status_msg
FROM public.schools s
WHERE s.id = 'a0000000-0000-0000-0000-000000000001'::uuid;

-- 3. Check if there's any data
SELECT 
  'DATA CHECK' as check_type,
  (SELECT COUNT(*) FROM public.classrooms) as classrooms,
  (SELECT COUNT(*) FROM public.children) as children,
  (SELECT COUNT(*) FROM public.users) as users,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.users) = 0 THEN '❌ No users found - run CREATE_PROPER_USERS.sql'
    WHEN (SELECT COUNT(*) FROM public.users) < 2 THEN '⚠️  Only 1 user found - create admin user'
    ELSE '✅ Users created'
  END as status;

-- 4. Test RLS policies
SELECT 
  'RLS POLICY CHECK' as check_type,
  tablename,
  policyname,
  'Policy exists' as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'schools', 'classrooms')
ORDER BY tablename, policyname;

-- ✅ Review results above to find the issue
