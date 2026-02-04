-- ============================================================
-- STEP 2 FIXED: Drop and recreate tables with correct types
-- ============================================================

-- First, check what we're dealing with
SELECT 'EXISTING TABLES:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check schools.id type
SELECT 'schools.id type:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'id';

-- Check if children exists and its school_id type
SELECT 'children columns:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'children';

-- ============================================================
-- DROP dependent tables first (in order of dependencies)
-- ============================================================
DROP TABLE IF EXISTS public.parent_child CASCADE;
DROP TABLE IF EXISTS public.teacher_classroom CASCADE;
DROP TABLE IF EXISTS public.attendance_logs CASCADE;
DROP TABLE IF EXISTS public.meal_logs CASCADE;
DROP TABLE IF EXISTS public.nap_logs CASCADE;
DROP TABLE IF EXISTS public.incident_reports CASCADE;
DROP TABLE IF EXISTS public.daily_activities CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;

-- Now drop children and classrooms
DROP TABLE IF EXISTS public.children CASCADE;
DROP TABLE IF EXISTS public.classrooms CASCADE;

-- ============================================================
-- RECREATE TABLES WITH CORRECT TYPES
-- ============================================================

-- 1. CLASSROOMS (school_id is UUID)
CREATE TABLE public.classrooms (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  capacity INTEGER DEFAULT 20,
  age_group TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX classrooms_school_id_idx ON public.classrooms(school_id);

-- 2. CHILDREN (school_id is UUID)
CREATE TABLE public.children (
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

CREATE INDEX children_school_id_idx ON public.children(school_id);
CREATE INDEX children_classroom_id_idx ON public.children(classroom_id);

-- 3. TEACHER-CLASSROOM JUNCTION
CREATE TABLE public.teacher_classroom (
  id BIGSERIAL PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, classroom_id)
);

CREATE INDEX teacher_classroom_teacher_idx ON public.teacher_classroom(teacher_id);
CREATE INDEX teacher_classroom_classroom_idx ON public.teacher_classroom(classroom_id);

-- 4. PARENT-CHILD JUNCTION
CREATE TABLE public.parent_child (
  id BIGSERIAL PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent',
  is_primary BOOLEAN DEFAULT true,
  can_pickup BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

CREATE INDEX parent_child_parent_idx ON public.parent_child(parent_id);
CREATE INDEX parent_child_child_idx ON public.parent_child(child_id);

-- VERIFY
SELECT 'STEP 2 COMPLETE!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
