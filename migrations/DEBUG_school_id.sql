-- ============================================================
-- FIND AND FIX THE SCHOOL_ID ISSUE
-- ============================================================

-- 1. Check for triggers that might reference school_id
SELECT 'TRIGGERS ON TABLES:' as info;
SELECT 
    event_object_table as table_name,
    trigger_name,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- 2. Check for views that might reference school_id
SELECT 'VIEWS:' as info;
SELECT table_name, view_definition 
FROM information_schema.views 
WHERE table_schema = 'public';

-- 3. Check for functions that might reference school_id
SELECT 'FUNCTIONS:' as info;
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public';

-- 4. Verify users.school_id exists RIGHT NOW
SELECT 'USERS COLUMNS RIGHT NOW:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users';

-- 5. Try to directly add school_id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'school_id'
  ) THEN
    EXECUTE 'ALTER TABLE public.users ADD COLUMN school_id BIGINT';
    RAISE NOTICE 'ADDED school_id column';
  ELSE
    RAISE NOTICE 'school_id already exists';
  END IF;
END $$;

-- 6. Verify again
SELECT 'AFTER FIX - USERS COLUMNS:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users';
