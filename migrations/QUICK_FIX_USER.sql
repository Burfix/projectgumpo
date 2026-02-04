-- ============================================================
-- QUICK FIX: Create Your User Profile
-- ============================================================
-- Run this AFTER logging in for the first time
-- Replace YOUR_EMAIL with your actual login email
-- ============================================================

-- Step 1: Create a school (if you don't have one)
INSERT INTO public.schools (id, name, city, country, status)
VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'My School',
  'Johannesburg',
  'South Africa',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Create your user profile
-- This will find your auth user and create a profile for them
INSERT INTO public.users (id, school_id, email, name, role, status)
SELECT 
  id,
  'a0000000-0000-0000-0000-000000000001'::uuid as school_id,
  email,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) as name,
  'PRINCIPAL' as role,
  'active' as status
FROM auth.users
WHERE email = 'YOUR_EMAIL_HERE@example.com'  -- ← CHANGE THIS TO YOUR EMAIL
ON CONFLICT (id) DO UPDATE SET
  school_id = EXCLUDED.school_id,
  role = EXCLUDED.role;

-- Step 3: Verify it worked
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  s.name as school_name
FROM public.users u
JOIN public.schools s ON s.id = u.school_id
WHERE u.email = 'YOUR_EMAIL_HERE@example.com';  -- ← CHANGE THIS TO YOUR EMAIL

-- If you see your user info above, you're ready! Try refreshing the dashboard.
