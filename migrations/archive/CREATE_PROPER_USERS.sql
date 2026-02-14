-- ============================================================
-- CLEAN AND CREATE PROPER USERS
-- ============================================================
-- This will clean up existing users and create proper roles
-- No manual UUID editing required!
-- ============================================================

-- Step 1: Remove all existing user profiles (not auth users)
DELETE FROM public.users;

-- Step 2: Keep the school (already exists from AUTO_FIX)

-- Step 3: Create Principal user (finds auth user by email automatically)
INSERT INTO public.users (id, school_id, email, name, role, status)
SELECT 
  au.id,
  'a0000000-0000-0000-0000-000000000001'::uuid as school_id,
  au.email,
  'School Principal' as name,
  'PRINCIPAL' as role,
  'active' as status
FROM auth.users au
WHERE au.email = 'principal@myschool.co.za'
ON CONFLICT (id) DO UPDATE SET
  school_id = EXCLUDED.school_id,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Step 4: Create Admin user (finds auth user by email automatically)
INSERT INTO public.users (id, school_id, email, name, role, status)
SELECT 
  au.id,
  'a0000000-0000-0000-0000-000000000001'::uuid as school_id,
  au.email,
  'Onboarding Admin' as name,
  'ADMIN' as role,
  'active' as status
FROM auth.users au
WHERE au.email = 'admin@myschool.co.za'
ON CONFLICT (id) DO UPDATE SET
  school_id = EXCLUDED.school_id,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Step 5: Verify
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  s.name as school_name,
  'User created!' as status
FROM public.users u
JOIN public.schools s ON s.id = u.school_id
ORDER BY u.role DESC, u.email;

-- ✅ You should see 2 users: Principal and Admin
-- ⚠️  If you see 0 rows, the auth users don't exist yet - create them first in Auth UI
