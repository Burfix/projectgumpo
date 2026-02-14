-- ============================================================
-- FIX: Align school_id type with schools.id
-- ============================================================

-- First, check what type schools.id actually is
SELECT 'schools.id type:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'id';

-- Drop school_id and recreate with correct type (UUID to match schools.id)
ALTER TABLE public.users DROP COLUMN IF EXISTS school_id;
ALTER TABLE public.users ADD COLUMN school_id UUID;

-- Now add the FK constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_school_id_fkey' AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_school_id_fkey 
      FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK constraint';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'FK constraint skipped: %', SQLERRM;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS users_school_id_idx ON public.users(school_id);

-- Verify
SELECT 'users.school_id is now:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'school_id';
