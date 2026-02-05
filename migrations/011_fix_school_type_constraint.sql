-- Fix school_type constraint to ensure correct values
-- Drop existing constraint and recreate with correct values

-- First, drop the old constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'schools_school_type_check' 
        AND table_name = 'schools'
    ) THEN
        ALTER TABLE public.schools DROP CONSTRAINT schools_school_type_check;
    END IF;
END $$;

-- Add the correct constraint
ALTER TABLE public.schools 
ADD CONSTRAINT schools_school_type_check 
CHECK (school_type IN ('Preschool', 'Crèche', 'Primary', 'Other'));

-- Update any existing invalid values to 'Other'
UPDATE public.schools 
SET school_type = 'Other' 
WHERE school_type NOT IN ('Preschool', 'Crèche', 'Primary', 'Other');
