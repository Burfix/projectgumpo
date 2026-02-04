-- ============================================================
-- STEP 3: ACTIVITY & LOG TABLES
-- ============================================================

-- 1. ATTENDANCE LOGS
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.users(id),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  checked_out_by UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'present',
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX attendance_child_idx ON public.attendance_logs(child_id);
CREATE INDEX attendance_date_idx ON public.attendance_logs(date);
CREATE INDEX attendance_school_idx ON public.attendance_logs(school_id);

-- 2. MEAL LOGS
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.users(id),
  meal_type TEXT NOT NULL,
  food_items TEXT,
  amount_eaten TEXT,
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX meal_logs_child_idx ON public.meal_logs(child_id);
CREATE INDEX meal_logs_date_idx ON public.meal_logs(date);
CREATE INDEX meal_logs_school_idx ON public.meal_logs(school_id);

-- 3. NAP LOGS
CREATE TABLE IF NOT EXISTS public.nap_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  quality TEXT,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX nap_logs_child_idx ON public.nap_logs(child_id);
CREATE INDEX nap_logs_date_idx ON public.nap_logs(date);
CREATE INDEX nap_logs_school_idx ON public.nap_logs(school_id);

-- 4. INCIDENT REPORTS
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.users(id),
  witnessed_by UUID REFERENCES public.users(id),
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  location TEXT,
  description TEXT NOT NULL,
  action_taken TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  parent_notified BOOLEAN DEFAULT false,
  parent_notified_at TIMESTAMPTZ,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX incidents_child_idx ON public.incident_reports(child_id);
CREATE INDEX incidents_date_idx ON public.incident_reports(date);
CREATE INDEX incidents_school_idx ON public.incident_reports(school_id);
CREATE INDEX incidents_severity_idx ON public.incident_reports(severity);

-- 5. DAILY ACTIVITIES
CREATE TABLE IF NOT EXISTS public.daily_activities (
  id BIGSERIAL PRIMARY KEY,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  materials_used TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX activities_classroom_idx ON public.daily_activities(classroom_id);
CREATE INDEX activities_date_idx ON public.daily_activities(date);
CREATE INDEX activities_school_idx ON public.daily_activities(school_id);

-- 6. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGSERIAL PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  recipient_id UUID REFERENCES public.users(id),
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  child_id BIGINT REFERENCES public.children(id) ON DELETE SET NULL,
  subject TEXT,
  body TEXT NOT NULL,
  message_type TEXT DEFAULT 'direct',
  priority TEXT DEFAULT 'normal',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX messages_school_idx ON public.messages(school_id);
CREATE INDEX messages_sender_idx ON public.messages(sender_id);
CREATE INDEX messages_recipient_idx ON public.messages(recipient_id);

-- 7. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX audit_logs_user_idx ON public.audit_logs(user_id);
CREATE INDEX audit_logs_school_idx ON public.audit_logs(school_id);
CREATE INDEX audit_logs_created_idx ON public.audit_logs(created_at);

-- VERIFY
SELECT 'STEP 3 COMPLETE - All activity tables created!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
