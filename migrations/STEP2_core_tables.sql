-- ============================================================
-- STEP 2: CORE TABLES - Schools, Classrooms, Children
-- ============================================================

-- 1. SCHOOLS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.schools (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  city TEXT,
  school_type TEXT DEFAULT 'Preschool',
  principal_name TEXT,
  principal_email TEXT,
  phone_number TEXT,
  subscription_tier TEXT DEFAULT 'Starter',
  account_status TEXT DEFAULT 'Trial',
  child_count INT DEFAULT 0,
  teacher_count INT DEFAULT 0,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to schools if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'city') THEN
    ALTER TABLE public.schools ADD COLUMN city TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'school_type') THEN
    ALTER TABLE public.schools ADD COLUMN school_type TEXT DEFAULT 'Preschool';
  END IF;
END $$;

-- 2. Add FK from users.school_id to schools.id
-- ============================================================
DO $$
BEGIN
  -- First ensure school_id column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE public.users ADD COLUMN school_id BIGINT;
    RAISE NOTICE 'Added school_id to users';
  END IF;

  -- Then add FK if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_school_id_fkey' AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_school_id_fkey 
      FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added FK constraint users_school_id_fkey';
  END IF;
END $$;

-- 3. CLASSROOMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.classrooms (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  capacity INTEGER DEFAULT 20,
  age_group TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS classrooms_school_id_idx ON public.classrooms(school_id);

-- 4. CHILDREN TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.children (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
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

-- Add classroom_id if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'children' AND column_name = 'classroom_id') THEN
    ALTER TABLE public.children ADD COLUMN classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'children' AND column_name = 'status') THEN
    ALTER TABLE public.children ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS children_school_id_idx ON public.children(school_id);
CREATE INDEX IF NOT EXISTS children_classroom_id_idx ON public.children(classroom_id);

-- 5. TEACHER-CLASSROOM JUNCTION
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

-- 6. PARENT-CHILD JUNCTION
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
SELECT 'STEP 2 COMPLETE - Core tables created:' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
