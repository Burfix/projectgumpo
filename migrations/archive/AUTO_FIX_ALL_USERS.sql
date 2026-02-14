-- ============================================================
-- AUTO-FIX: Create User Profile for Current Session
-- ============================================================
-- ⚠️ DEPRECATED: Use CREATE_PROPER_USERS.sql instead
-- This script creates ALL users as PRINCIPAL which is not ideal
-- ============================================================

-- Step 1: Create a default school
INSERT INTO public.schools (id, name, city, country, status)
VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'My School',
  'Johannesburg',
  'South Africa',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Step 2: Auto-assign roles based on email domain
INSERT INTO public.users (id, school_id, email, name, role, status)
SELECT 
  au.id,
  'a0000000-0000-0000-0000-000000000001'::uuid as school_id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as name,
  CASE 
    WHEN au.email LIKE '%principal%' THEN 'PRINCIPAL'
    WHEN au.email LIKE '%admin%' THEN 'ADMIN'
    WHEN au.email LIKE '%teacher%' THEN 'TEACHER'
    WHEN au.email LIKE '%parent%' THEN 'PARENT'
    ELSE 'PRINCIPAL'  -- Default to principal
  END as role,
  'active' as status
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL  -- Only users without profiles
ON CONFLICT (id) DO UPDATE SET
  school_id = EXCLUDED.school_id,
  role = CASE 
    WHEN users.role = 'SUPER_ADMIN' THEN 'SUPER_ADMIN'  -- Don't downgrade super admins
    ELSE EXCLUDED.role 
  END;

-- Step 3: Show all users
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  s.name as school_name,
  'Profile created!' as status
FROM public.users u
JOIN public.schools s ON s.id = u.school_id
ORDER BY u.created_at DESC;

-- ✅ If you see your email above, refresh the dashboard now!
