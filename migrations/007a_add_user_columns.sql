-- PART 1: Add missing columns to public.users
-- Run this FIRST, then run Part 2

-- Add school_id to public.users if missing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'school_id'
    ) THEN
      ALTER TABLE public.users ADD COLUMN school_id BIGINT;
      RAISE NOTICE 'Added school_id to public.users';
    ELSE
      RAISE NOTICE 'school_id already exists in public.users';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
    ) THEN
      ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'PARENT';
      RAISE NOTICE 'Added role to public.users';
    ELSE
      RAISE NOTICE 'role already exists in public.users';
    END IF;
  ELSE
    -- Create public.users if it doesn't exist
    CREATE TABLE public.users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT,
      name TEXT,
      role TEXT DEFAULT 'PARENT',
      school_id BIGINT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    RAISE NOTICE 'Created public.users table';
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS users_school_id_idx ON public.users(school_id);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);

-- Verify columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
