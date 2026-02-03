-- Add school_type column to schools table
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS school_type TEXT CHECK (school_type IN ('Preschool', 'Crèche', 'Primary', 'Other'));

-- Add an index on school_type for faster queries
CREATE INDEX IF NOT EXISTS schools_school_type_idx ON public.schools(school_type);

-- Update the comment
COMMENT ON COLUMN public.schools.school_type IS 'Type of school: Preschool, Crèche, Primary, or Other';
