-- ============================================================
-- STEP 2: CORE TABLES (Using UUID for school_id)
-- ============================================================

-- 1. CLASSROOMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.classrooms (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  capacity INTEGER DEFAULT 20,
  age_group TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS classrooms_school_id_idx ON public.classrooms(school_id);

-- 2. CHILDREN TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.children (
  id BIGSERIAL PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  allergies TEXT,
  medical_notes TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  photo_url TEXT,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Fix children.school_id if wrong type
DO $$
BEGIN
  -- Check if school_id exists but is wrong type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'children' AND column_name = 'school_id' AND data_type = 'bigint'
  ) THEN
    ALTER TABLE public.children DROP COLUMN school_id;
    ALTER TABLE public.children ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
    RAISE NOTICE 'Fixed children.school_id to UUID';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS children_school_id_idx ON public.children(school_id);
CREATE INDEX IF NOT EXISTS children_classroom_id_idx ON public.children(classroom_id);

-- 3. TEACHER-CLASSROOM JUNCTION
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teacher_classroom (
  id BIGSERIAL PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, classroom_id)
);

CREATE INDEX IF NOT EXISTS teacher_classroom_teacher_idx ON public.teacher_classroom(teacher_id);
CREATE INDEX IF NOT EXISTS teacher_classroom_classroom_idx ON public.teacher_classroom(classroom_id);

-- 4. PARENT-CHILD JUNCTION
-- ============================================================
CREATE TABLE IF NOT EXISTS public.parent_child (
  id BIGSERIAL PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent',
  is_primary BOOLEAN DEFAULT true,
  can_pickup BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

CREATE INDEX IF NOT EXISTS parent_child_parent_idx ON public.parent_child(parent_id);
CREATE INDEX IF NOT EXISTS parent_child_child_idx ON public.parent_child(child_id);

-- VERIFY
SELECT 'STEP 2 COMPLETE - Tables created:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
