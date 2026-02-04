-- Migration 007: Create Core Tables for MVP
-- This migration creates all essential tables needed for Teacher and Parent features

-- ====================
-- 0. ENSURE USERS TABLE HAS SCHOOL_ID
-- ====================
DO $$
BEGIN
  -- Add school_id to users table if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'school_id'
  ) THEN
    -- First check if schools table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schools') THEN
      ALTER TABLE public.users ADD COLUMN school_id BIGINT REFERENCES public.schools(id) ON DELETE SET NULL;
      CREATE INDEX IF NOT EXISTS users_school_id_idx ON public.users(school_id);
      RAISE NOTICE 'Added school_id column to users table';
    ELSE
      RAISE EXCEPTION 'schools table does not exist. Please run previous migrations first.';
    END IF;
  ELSE
    RAISE NOTICE 'school_id column already exists in users table';
  END IF;
END $$;

-- ====================
-- 1. CLASSROOMS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS public.classrooms (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Sunflower Room", "Preschool A"
  age_group TEXT, -- e.g., "2-3 years", "3-4 years"
  capacity INTEGER DEFAULT 20,
  status TEXT DEFAULT 'Active', -- Active, Inactive
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for school queries
CREATE INDEX IF NOT EXISTS classrooms_school_id_idx ON public.classrooms(school_id);

-- RLS Policies
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view classrooms in their school" ON public.classrooms;
CREATE POLICY "Users can view classrooms in their school" ON public.classrooms
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.users WHERE id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
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
  UNIQUE(teacher_id, classroom_id) -- One teacher can't be assigned to same classroom twice
);

-- Indexes
CREATE INDEX IF NOT EXISTS teacher_classroom_teacher_idx ON public.teacher_classroom(teacher_id);
CREATE INDEX IF NOT EXISTS teacher_classroom_classroom_idx ON public.teacher_classroom(classroom_id);
CREATE INDEX IF NOT EXISTS teacher_classroom_school_idx ON public.teacher_classroom(school_id);

-- RLS Policies
ALTER TABLE public.teacher_classroom ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view teacher assignments in their school" ON public.teacher_classroom;
CREATE POLICY "Users can view teacher assignments in their school" ON public.teacher_classroom
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.users WHERE id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

-- ====================
-- 3. UPDATE CHILDREN TABLE (add classroom_id if missing)
-- ====================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'children' AND column_name = 'classroom_id'
  ) THEN
    ALTER TABLE public.children ADD COLUMN classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL;
    CREATE INDEX children_classroom_id_idx ON public.children(classroom_id);
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
  UNIQUE(child_id, date) -- One attendance record per child per day
);

-- Indexes
CREATE INDEX IF NOT EXISTS attendance_logs_child_idx ON public.attendance_logs(child_id);
CREATE INDEX IF NOT EXISTS attendance_logs_school_date_idx ON public.attendance_logs(school_id, date);
CREATE INDEX IF NOT EXISTS attendance_logs_teacher_idx ON public.attendance_logs(teacher_id);

-- RLS Policies
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view attendance in their school" ON public.attendance_logs;
CREATE POLICY "Users can view attendance in their school" ON public.attendance_logs
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.users WHERE id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "Teachers can insert attendance" ON public.attendance_logs;
CREATE POLICY "Teachers can insert attendance" ON public.attendance_logs
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
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
  description TEXT, -- e.g., "Ate all vegetables, refused fruit"
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TIME NOT NULL DEFAULT CURRENT_TIME,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS meal_logs_child_idx ON public.meal_logs(child_id);
CREATE INDEX IF NOT EXISTS meal_logs_school_date_idx ON public.meal_logs(school_id, date);

-- RLS Policies
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view meals in their school" ON public.meal_logs;
CREATE POLICY "Users can view meals in their school" ON public.meal_logs
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.users WHERE id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "Teachers can insert meals" ON public.meal_logs;
CREATE POLICY "Teachers can insert meals" ON public.meal_logs
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
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
  duration_minutes INTEGER, -- Calculated when end_time is set
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS nap_logs_child_idx ON public.nap_logs(child_id);
CREATE INDEX IF NOT EXISTS nap_logs_school_date_idx ON public.nap_logs(school_id, date);

-- RLS Policies
ALTER TABLE public.nap_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view naps in their school" ON public.nap_logs;
CREATE POLICY "Users can view naps in their school" ON public.nap_logs
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.users WHERE id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "Teachers can manage naps" ON public.nap_logs;
CREATE POLICY "Teachers can manage naps" ON public.nap_logs
  FOR ALL USING (
    teacher_id = auth.uid() AND
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
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

-- Indexes
CREATE INDEX IF NOT EXISTS incident_reports_child_idx ON public.incident_reports(child_id);
CREATE INDEX IF NOT EXISTS incident_reports_school_idx ON public.incident_reports(school_id);
CREATE INDEX IF NOT EXISTS incident_reports_status_idx ON public.incident_reports(status);

-- RLS Policies
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view incidents in their school" ON public.incident_reports;
CREATE POLICY "Users can view incidents in their school" ON public.incident_reports
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.users WHERE id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "Teachers can create incidents" ON public.incident_reports;
CREATE POLICY "Teachers can create incidents" ON public.incident_reports
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- ====================
-- 8. DAILY ACTIVITIES
-- ====================
CREATE TABLE IF NOT EXISTS public.daily_activities (
  id BIGSERIAL PRIMARY KEY,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL, -- e.g., "Morning Circle", "Art Time"
  description TEXT, -- e.g., "Painted with watercolors, created butterfly art"
  activity_time TIME NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_urls TEXT[], -- Array of photo URLs
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS daily_activities_classroom_idx ON public.daily_activities(classroom_id);
CREATE INDEX IF NOT EXISTS daily_activities_school_date_idx ON public.daily_activities(school_id, date);

-- RLS Policies
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view activities in their school" ON public.daily_activities;
CREATE POLICY "Users can view activities in their school" ON public.daily_activities
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.users WHERE id = auth.uid()
    ) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

DROP POLICY IF EXISTS "Teachers can create activities" ON public.daily_activities;
CREATE POLICY "Teachers can create activities" ON public.daily_activities
  FOR INSERT WITH CHECK (
    teacher_id = auth.uid() AND
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- ====================
-- 9. PARENT-CHILD RELATIONSHIP
-- ====================
CREATE TABLE IF NOT EXISTS public.parent_child (
  id BIGSERIAL PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'Parent', -- Parent, Guardian, Emergency Contact
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS parent_child_parent_idx ON public.parent_child(parent_id);
CREATE INDEX IF NOT EXISTS parent_child_child_idx ON public.parent_child(child_id);

-- RLS Policies
ALTER TABLE public.parent_child ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their relationships" ON public.parent_child;
CREATE POLICY "Users can view their relationships" ON public.parent_child
  FOR SELECT USING (
    parent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.children c ON c.school_id = u.school_id
      WHERE u.id = auth.uid() AND c.id = child_id
    ) OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

-- ====================
-- 10. MESSAGES (Parent-Teacher Communication)
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

-- Indexes
CREATE INDEX IF NOT EXISTS messages_sender_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_child_idx ON public.messages(child_id);

-- RLS Policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid() OR
    recipient_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN') AND school_id = messages.school_id)
  );

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- ====================
-- COMPLETION MESSAGE
-- ====================
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 007 completed successfully!';
  RAISE NOTICE 'Created tables:';
  RAISE NOTICE '  - classrooms';
  RAISE NOTICE '  - teacher_classroom';
  RAISE NOTICE '  - attendance_logs';
  RAISE NOTICE '  - meal_logs';
  RAISE NOTICE '  - nap_logs';
  RAISE NOTICE '  - incident_reports';
  RAISE NOTICE '  - daily_activities';
  RAISE NOTICE '  - parent_child';
  RAISE NOTICE '  - messages';
  RAISE NOTICE 'All tables have RLS policies enabled.';
  RAISE NOTICE 'Ready for Teacher and Parent dashboard implementation!';
END $$;
