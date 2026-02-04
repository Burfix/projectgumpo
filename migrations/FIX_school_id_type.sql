-- ============================================================
-- FIX: Change school_id from UUID to BIGINT
-- ============================================================

-- Drop the incorrectly typed school_id column
ALTER TABLE public.users DROP COLUMN IF EXISTS school_id;

-- Add it back with correct type (BIGINT to match schools.id)
ALTER TABLE public.users ADD COLUMN school_id BIGINT;

-- Create index
CREATE INDEX IF NOT EXISTS users_school_id_idx ON public.users(school_id);

-- Verify the fix
SELECT 'FIXED - school_id is now BIGINT:' as status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;
