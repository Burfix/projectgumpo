-- ============================================================
-- CLEAN AND CREATE PROPER USERS
-- ============================================================
-- This will clean up existing users and create proper roles
-- ============================================================

-- Step 1: Remove all existing user profiles (not auth users)
DELETE FROM public.users;

-- Step 2: Keep the school
-- (School already exists from AUTO_FIX)

-- Step 3: Create Principal user
-- First, create the auth user in Supabase Auth UI:
-- Email: principal@myschool.co.za
-- Then run this script and replace the UUID below

INSERT INTO public.users (id, school_id, email, name, role, status)
VALUES (
  'REPLACE_WITH_PRINCIPAL_AUTH_UUID'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'principal@myschool.co.za',
  'School Principal',
  'PRINCIPAL',
  'active'
) ON CONFLICT (id) DO UPDATE SET
  school_id = EXCLUDED.school_id,
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Step 4: Create Onboarding Admin user
-- First, create the auth user in Supabase Auth UI:
-- Email: admin@myschool.co.za
-- Then run this script and replace the UUID below

INSERT INTO public.users (id, school_id, email, name, role, status)
VALUES (
  'REPLACE_WITH_ADMIN_AUTH_UUID'::uuid,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'admin@myschool.co.za',
  'Onboarding Admin',
  'ADMIN',
  'active'
) ON CONFLICT (id) DO UPDATE SET
  school_id = EXCLUDED.school_id,
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Step 5: Verify
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  s.name as school_name
FROM public.users u
JOIN public.schools s ON s.id = u.school_id
ORDER BY u.role DESC, u.email;

-- ✅ You should see 2 users: Principal and Admin
