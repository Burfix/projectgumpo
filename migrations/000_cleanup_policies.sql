-- ============================================================
-- STEP 0: CLEANUP - Run this FIRST before anything else
-- ============================================================
-- This drops problematic policies that reference school_id
-- ============================================================

-- Drop ALL existing policies on children table (they reference users.school_id)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'children'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.children', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Drop ALL existing policies on users table
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', pol.policyname);
        RAISE NOTICE 'Dropped policy: %', pol.policyname;
    END LOOP;
END $$;

-- Drop policies on other tables that might reference users.school_id
DO $$
DECLARE
    pol RECORD;
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['schools', 'classrooms', 'invites', 'subscriptions', 'invoices', 'attendance_logs', 'meal_logs', 'nap_logs', 'incident_reports', 'daily_activities', 'messages', 'teacher_classroom', 'parent_child'])
    LOOP
        FOR pol IN 
            SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
            RAISE NOTICE 'Dropped policy % on %', pol.policyname, tbl;
        END LOOP;
    END LOOP;
END $$;

-- Now check what columns exist in public.users
SELECT 'Current public.users columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Check if public.users table exists at all
SELECT 'public.users exists:' as info;
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users'
) as users_table_exists;

SELECT 'Cleanup complete! Now run 008_complete_schema.sql' as status;
