-- =====================================================
-- CREATE SECONDARY PRINCIPAL USER
-- Quick script to create a secondary principal for testing
-- =====================================================

-- Step 1: Check if auth user exists
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'secondary@myschool.co.za';

-- Step 2: Create or update user profile
-- Replace 'USER_UUID_FROM_STEP_1' with the actual UUID from auth.users
DO $$
DECLARE
  v_user_id UUID;
  v_school_id UUID := 'a0000000-0000-0000-0000-000000000001'; -- Default school
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'secondary@myschool.co.za';

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'Auth user not found. Please create user in Supabase Auth first.';
    RAISE NOTICE 'Go to Authentication > Users and create: secondary@myschool.co.za';
  ELSE
    -- Insert or update user profile
    INSERT INTO public.users (
      id,
      email,
      full_name,
      role,
      school_id,
      phone_number
    ) VALUES (
      v_user_id,
      'secondary@myschool.co.za',
      'Secondary Principal Test User',
      'SECONDARY_PRINCIPAL',
      v_school_id,
      '+27123456789'
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'SECONDARY_PRINCIPAL',
      full_name = 'Secondary Principal Test User',
      school_id = v_school_id;

    RAISE NOTICE 'User profile created/updated successfully!';
    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE 'School ID: %', v_school_id;
  END IF;
END $$;

-- Step 3: Verify the user was created correctly
SELECT 
  id,
  email,
  full_name,
  role,
  school_id,
  created_at,
  updated_at
FROM public.users
WHERE email = 'secondary@myschool.co.za';

-- Step 4: Check what data the user will see (scoped by school_id)
DO $$
DECLARE
  v_user_id UUID;
  v_school_id UUID;
  v_teacher_count INT;
  v_parent_count INT;
  v_child_count INT;
  v_class_count INT;
BEGIN
  -- Get user's school_id
  SELECT id, school_id INTO v_user_id, v_school_id
  FROM public.users
  WHERE email = 'secondary@myschool.co.za';

  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User not found in public.users';
    RETURN;
  END IF;

  -- Count teachers
  SELECT COUNT(*) INTO v_teacher_count
  FROM public.users
  WHERE school_id = v_school_id AND role = 'TEACHER';

  -- Count parents
  SELECT COUNT(*) INTO v_parent_count
  FROM public.users
  WHERE school_id = v_school_id AND role = 'PARENT';

  -- Count children
  SELECT COUNT(*) INTO v_child_count
  FROM public.children
  WHERE school_id = v_school_id;

  -- Count classrooms
  SELECT COUNT(*) INTO v_class_count
  FROM public.classrooms
  WHERE school_id = v_school_id;

  RAISE NOTICE '=== DATA VISIBILITY FOR SECONDARY PRINCIPAL ===';
  RAISE NOTICE 'School ID: %', v_school_id;
  RAISE NOTICE 'Teachers: %', v_teacher_count;
  RAISE NOTICE 'Parents: %', v_parent_count;
  RAISE NOTICE 'Children: %', v_child_count;
  RAISE NOTICE 'Classrooms: %', v_class_count;
  
  IF v_teacher_count = 0 AND v_parent_count = 0 AND v_child_count = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE 'WARNING: No data found for this school!';
    RAISE NOTICE 'You may want to run SEED_DATA.sql to populate test data.';
  END IF;
END $$;

-- Step 5: Test RLS policies (simulate user context)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM public.users
  WHERE email = 'secondary@myschool.co.za';

  IF v_user_id IS NOT NULL THEN
    RAISE NOTICE '';
    RAISE NOTICE '=== RLS POLICY TEST ===';
    RAISE NOTICE 'Testing as user: %', v_user_id;
    RAISE NOTICE 'Run these queries manually to test RLS:';
    RAISE NOTICE '';
    RAISE NOTICE 'SET LOCAL role TO authenticated;';
    RAISE NOTICE 'SET LOCAL request.jwt.claims TO ''{"sub": "%"}''::json;', v_user_id;
    RAISE NOTICE 'SELECT * FROM users WHERE role = ''TEACHER'';';
    RAISE NOTICE 'SELECT * FROM children;';
    RAISE NOTICE 'SELECT * FROM classrooms;';
  END IF;
END $$;

-- =====================================================
-- MANUAL STEPS (if auto-creation fails)
-- =====================================================
-- 
-- 1. Create auth user in Supabase Dashboard:
--    Email: secondary@myschool.co.za
--    Password: Test@123456
--
-- 2. Get the user's UUID from auth.users
--
-- 3. Run this manual INSERT:
/*
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  school_id
) VALUES (
  'PASTE_UUID_HERE',
  'secondary@myschool.co.za',
  'Secondary Principal',
  'SECONDARY_PRINCIPAL',
  'a0000000-0000-0000-0000-000000000001'
);
*/

-- =====================================================
-- CLEANUP (if you need to start over)
-- =====================================================
-- DELETE FROM public.users WHERE email = 'secondary@myschool.co.za';
-- Then delete from Supabase Auth Dashboard
