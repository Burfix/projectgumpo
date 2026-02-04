-- ============================================================
-- BULLETPROOF SCHEMA - CREATES SCHOOL_ID FIRST
-- ============================================================
-- Run this in Supabase SQL Editor
-- ============================================================

-- STEP 1: Ensure public.users table exists with school_id
-- ============================================================

-- Check if users table exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    CREATE TABLE public.users (
      id UUID PRIMARY KEY,
      email TEXT,
      name TEXT,
      role TEXT DEFAULT 'PARENT',
      school_id BIGINT,
      avatar_url TEXT,
      phone TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    RAISE NOTICE 'Created public.users table';
  ELSE
    RAISE NOTICE 'public.users table already exists';
  END IF;
END $$;

-- Add school_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN school_id BIGINT;
    RAISE NOTICE 'Added school_id column to public.users';
  ELSE
    RAISE NOTICE 'school_id column already exists in public.users';
  END IF;
END $$;

-- Add role column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'PARENT';
    RAISE NOTICE 'Added role column to public.users';
  ELSE
    RAISE NOTICE 'role column already exists in public.users';
  END IF;
END $$;

-- Verify school_id exists now
SELECT 'VERIFICATION - public.users columns:' as step;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
