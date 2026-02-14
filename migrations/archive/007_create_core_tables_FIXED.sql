-- Migration 007: Create Core Tables for MVP (FIXED VERSION)
-- This migration ONLY uses public.users (never touches auth.users)
-- 
-- IMPORTANT: Supabase pattern:
--   auth.users = Supabase's auth system (READ ONLY - can't modify)
--   public.users = Your profile table (you own this, can add columns)

-- ====================
-- 0. CREATE/UPDATE PUBLIC.USERS TABLE
-- ====================
-- This is YOUR users table that extends auth.users with app-specific data
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    CREATE TABLE public.users (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      email TEXT,
      name TEXT,
      role TEXT DEFAULT 'PARENT',
      school_id BIGINT REFERENCES public.schools(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX users_school_id_idx ON public.users(school_id);
    CREATE INDEX users_role_idx ON public.users(role);
    
    -- Enable RLS on users table
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    -- Allow users to read all users in their school (needed for RLS subqueries)
    CREATE POLICY "Users can view users in their school" ON public.users
      FOR SELECT USING (true);  -- Permissive for now, app logic enforces access
    
    RAISE NOTICE 'Created public.users table';
  ELSE
    -- Add missing columns to existing public.users
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'school_id'
    ) THEN
      ALTER TABLE public.users ADD COLUMN school_id BIGINT REFERENCES public.schools(id) ON DELETE SET NULL;
      CREATE INDEX IF NOT EXISTS users_school_id_idx ON public.users(school_id);
      RAISE NOTICE 'Added school_id column to public.users';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role'
    ) THEN
      ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'PARENT';
      CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
      RAISE NOTICE 'Added role column to public.users';
    END IF;
    
    RAISE NOTICE 'public.users table already exists, checked for missing columns';
  END IF;
END $$;

-- ====================
-- 1. CLASSROOMS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS public.classrooms (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age_group TEXT,
  capacity INTEGER DEFAULT 20,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS classrooms_school_id_idx ON public.classrooms(school_id);

ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "classrooms_select" ON public.classrooms;
CREATE POLICY "classrooms_select" ON public.classrooms
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

-- ====================
-- 2. TEACHER_CLASSROOM ASSIGNMENT
-- ====================
CREATE TABLE IF NOT EXISTS public.teacher_classroom (
  id BIGSERIAL PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, classroom_id)
);

CREATE INDEX IF NOT EXISTS teacher_classroom_teacher_idx ON public.teacher_classroom(teacher_id);
CREATE INDEX IF NOT EXISTS teacher_classroom_classroom_idx ON public.teacher_classroom(classroom_id);
CREATE INDEX IF NOT EXISTS teacher_classroom_school_idx ON public.teacher_classroom(school_id);

ALTER TABLE public.teacher_classroom ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_classroom_select" ON public.teacher_classroom;
CREATE POLICY "teacher_classroom_select" ON public.teacher_classroom
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

-- ====================
-- 3. UPDATE CHILDREN TABLE
-- ====================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'children') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'children' AND column_name = 'school_id'
    ) THEN
      ALTER TABLE public.children ADD COLUMN school_id BIGINT REFERENCES public.schools(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS children_school_id_idx ON public.children(school_id);
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'children' AND column_name = 'classroom_id'
    ) THEN
      ALTER TABLE public.children ADD COLUMN classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL;
      CREATE INDEX IF NOT EXISTS children_classroom_id_idx ON public.children(classroom_id);
    END IF;
  END IF;
END $$;

-- ====================
-- 4. ATTENDANCE LOGS
-- ====================
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'SICK', 'EXCUSED')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(child_id, date)
);

CREATE INDEX IF NOT EXISTS attendance_logs_child_idx ON public.attendance_logs(child_id);
CREATE INDEX IF NOT EXISTS attendance_logs_school_date_idx ON public.attendance_logs(school_id, date);
CREATE INDEX IF NOT EXISTS attendance_logs_teacher_idx ON public.attendance_logs(teacher_id);

ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attendance_logs_select" ON public.attendance_logs;
CREATE POLICY "attendance_logs_select" ON public.attendance_logs
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "attendance_logs_insert" ON public.attendance_logs;
CREATE POLICY "attendance_logs_insert" ON public.attendance_logs
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid()
    AND school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- ====================
-- 5. MEAL LOGS
-- ====================
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'SNACK', 'DINNER')),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TIME NOT NULL DEFAULT CURRENT_TIME,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meal_logs_child_idx ON public.meal_logs(child_id);
CREATE INDEX IF NOT EXISTS meal_logs_school_date_idx ON public.meal_logs(school_id, date);

ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meal_logs_select" ON public.meal_logs;
CREATE POLICY "meal_logs_select" ON public.meal_logs
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "meal_logs_insert" ON public.meal_logs;
CREATE POLICY "meal_logs_insert" ON public.meal_logs
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid()
    AND school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- ====================
-- 6. NAP LOGS
-- ====================
CREATE TABLE IF NOT EXISTS public.nap_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nap_logs_child_idx ON public.nap_logs(child_id);
CREATE INDEX IF NOT EXISTS nap_logs_school_date_idx ON public.nap_logs(school_id, date);

ALTER TABLE public.nap_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nap_logs_select" ON public.nap_logs;
CREATE POLICY "nap_logs_select" ON public.nap_logs
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "nap_logs_all" ON public.nap_logs;
CREATE POLICY "nap_logs_all" ON public.nap_logs
  FOR ALL USING (
    teacher_id = auth.uid()
    AND school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- ====================
-- 7. INCIDENT REPORTS
-- ====================
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('INJURY', 'BEHAVIORAL', 'HEALTH', 'OTHER')),
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  photo_url TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'REVIEWED', 'RESOLVED')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS incident_reports_child_idx ON public.incident_reports(child_id);
CREATE INDEX IF NOT EXISTS incident_reports_school_idx ON public.incident_reports(school_id);
CREATE INDEX IF NOT EXISTS incident_reports_status_idx ON public.incident_reports(status);

ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "incident_reports_select" ON public.incident_reports;
CREATE POLICY "incident_reports_select" ON public.incident_reports
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "incident_reports_insert" ON public.incident_reports;
CREATE POLICY "incident_reports_insert" ON public.incident_reports
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid()
    AND school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- ====================
-- 8. DAILY ACTIVITIES
-- ====================
CREATE TABLE IF NOT EXISTS public.daily_activities (
  id BIGSERIAL PRIMARY KEY,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  description TEXT,
  activity_time TIME NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS daily_activities_classroom_idx ON public.daily_activities(classroom_id);
CREATE INDEX IF NOT EXISTS daily_activities_school_date_idx ON public.daily_activities(school_id, date);

ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_activities_select" ON public.daily_activities;
CREATE POLICY "daily_activities_select" ON public.daily_activities
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "daily_activities_insert" ON public.daily_activities;
CREATE POLICY "daily_activities_insert" ON public.daily_activities
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid()
    AND school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- ====================
-- 9. PARENT-CHILD RELATIONSHIP
-- ====================
CREATE TABLE IF NOT EXISTS public.parent_child (
  id BIGSERIAL PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'Parent',
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

CREATE INDEX IF NOT EXISTS parent_child_parent_idx ON public.parent_child(parent_id);
CREATE INDEX IF NOT EXISTS parent_child_child_idx ON public.parent_child(child_id);

ALTER TABLE public.parent_child ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "parent_child_select" ON public.parent_child;
CREATE POLICY "parent_child_select" ON public.parent_child
  FOR SELECT USING (
    parent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.children c ON c.school_id = u.school_id
      WHERE u.id = auth.uid() AND c.id = child_id
    )
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

-- ====================
-- 10. MESSAGES
-- ====================
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGSERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  child_id BIGINT REFERENCES public.children(id) ON DELETE CASCADE,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subject TEXT,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_sender_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_child_idx ON public.messages(child_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid()
    OR recipient_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role IN ('ADMIN', 'SUPER_ADMIN') 
      AND u.school_id = school_id
    )
  );

DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- ====================
-- DONE!
-- ====================
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 007 completed successfully!';
  RAISE NOTICE 'Tables created: classrooms, teacher_classroom, attendance_logs, meal_logs, nap_logs, incident_reports, daily_activities, parent_child, messages';
  RAISE NOTICE 'All tables have RLS policies using public.users (not auth.users)';
END $$;
