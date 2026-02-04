-- PART 2: Create core tables
-- Run this AFTER 007a_add_user_columns.sql succeeds

-- ===========================================
-- 1. CLASSROOMS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.classrooms (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  capacity INTEGER DEFAULT 20,
  age_group TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS classrooms_school_id_idx ON public.classrooms(school_id);

-- ===========================================
-- 2. TEACHER-CLASSROOM JUNCTION TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.teacher_classroom (
  id BIGSERIAL PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, classroom_id)
);

CREATE INDEX IF NOT EXISTS teacher_classroom_teacher_idx ON public.teacher_classroom(teacher_id);
CREATE INDEX IF NOT EXISTS teacher_classroom_classroom_idx ON public.teacher_classroom(classroom_id);

-- ===========================================
-- 3. ATTENDANCE LOGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.users(id),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'present', -- present, absent, late, excused
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS attendance_child_idx ON public.attendance_logs(child_id);
CREATE INDEX IF NOT EXISTS attendance_date_idx ON public.attendance_logs(date);
CREATE INDEX IF NOT EXISTS attendance_school_idx ON public.attendance_logs(school_id);

-- ===========================================
-- 4. MEAL LOGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.users(id),
  meal_type TEXT NOT NULL, -- breakfast, lunch, snack
  amount_eaten TEXT, -- all, most, some, none
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meal_logs_child_idx ON public.meal_logs(child_id);
CREATE INDEX IF NOT EXISTS meal_logs_date_idx ON public.meal_logs(date);
CREATE INDEX IF NOT EXISTS meal_logs_school_idx ON public.meal_logs(school_id);

-- ===========================================
-- 5. NAP LOGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.nap_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  quality TEXT, -- good, restless, refused
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nap_logs_child_idx ON public.nap_logs(child_id);
CREATE INDEX IF NOT EXISTS nap_logs_date_idx ON public.nap_logs(date);
CREATE INDEX IF NOT EXISTS nap_logs_school_idx ON public.nap_logs(school_id);

-- ===========================================
-- 6. INCIDENT REPORTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.users(id),
  incident_type TEXT NOT NULL, -- injury, behavior, health, other
  severity TEXT NOT NULL DEFAULT 'low', -- low, medium, high
  description TEXT NOT NULL,
  action_taken TEXT,
  parent_notified BOOLEAN DEFAULT false,
  parent_notified_at TIMESTAMPTZ,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS incidents_child_idx ON public.incident_reports(child_id);
CREATE INDEX IF NOT EXISTS incidents_date_idx ON public.incident_reports(date);
CREATE INDEX IF NOT EXISTS incidents_school_idx ON public.incident_reports(school_id);
CREATE INDEX IF NOT EXISTS incidents_severity_idx ON public.incident_reports(severity);

-- ===========================================
-- 7. DAILY ACTIVITIES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.daily_activities (
  id BIGSERIAL PRIMARY KEY,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  activity_type TEXT NOT NULL, -- art, music, outdoor, learning, play
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activities_classroom_idx ON public.daily_activities(classroom_id);
CREATE INDEX IF NOT EXISTS activities_date_idx ON public.daily_activities(date);
CREATE INDEX IF NOT EXISTS activities_school_idx ON public.daily_activities(school_id);

-- ===========================================
-- 8. PARENT-CHILD JUNCTION TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.parent_child (
  id BIGSERIAL PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent', -- parent, guardian, emergency_contact
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

CREATE INDEX IF NOT EXISTS parent_child_parent_idx ON public.parent_child(parent_id);
CREATE INDEX IF NOT EXISTS parent_child_child_idx ON public.parent_child(child_id);

-- ===========================================
-- 9. MESSAGES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  recipient_id UUID REFERENCES public.users(id),
  classroom_id BIGINT REFERENCES public.classrooms(id),
  subject TEXT,
  body TEXT NOT NULL,
  is_announcement BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_school_idx ON public.messages(school_id);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON public.messages(recipient_id);

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
SELECT 'All tables created successfully!' as status;
