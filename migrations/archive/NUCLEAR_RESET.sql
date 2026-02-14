-- ============================================================
-- NUCLEAR RESET - DROP ALL AND REBUILD
-- ============================================================
-- This drops ALL custom tables and recreates them correctly
-- ============================================================

-- STEP 1: Drop ALL RLS policies on ALL tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
        RAISE NOTICE 'Dropped policy % on %.%', r.policyname, r.schemaname, r.tablename;
    END LOOP;
END $$;

-- STEP 2: Drop ALL triggers
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT trigger_name, event_object_table FROM information_schema.triggers WHERE trigger_schema = 'public')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', r.trigger_name, r.event_object_table);
        RAISE NOTICE 'Dropped trigger % on %', r.trigger_name, r.event_object_table;
    END LOOP;
END $$;

-- STEP 3: Drop ALL tables in correct order (dependencies first)
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.daily_activities CASCADE;
DROP TABLE IF EXISTS public.incident_reports CASCADE;
DROP TABLE IF EXISTS public.nap_logs CASCADE;
DROP TABLE IF EXISTS public.meal_logs CASCADE;
DROP TABLE IF EXISTS public.attendance_logs CASCADE;
DROP TABLE IF EXISTS public.parent_child CASCADE;
DROP TABLE IF EXISTS public.teacher_classroom CASCADE;
DROP TABLE IF EXISTS public.children CASCADE;
DROP TABLE IF EXISTS public.classrooms CASCADE;
-- Keep schools, users, invites, subscriptions, invoices

SELECT 'All dependent tables dropped. Now recreating...' as status;

-- ============================================================
-- RECREATE ALL TABLES
-- ============================================================

-- Verify schools.id and users.school_id types
SELECT 'schools.id type:' as check1, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'id';

SELECT 'users.school_id type:' as check2, data_type FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'school_id';

-- 1. CLASSROOMS
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

-- 2. CHILDREN
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

-- 3. TEACHER-CLASSROOM
CREATE TABLE public.teacher_classroom (
  id BIGSERIAL PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, classroom_id)
);

-- 4. PARENT-CHILD
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

-- 5. ATTENDANCE LOGS
CREATE TABLE public.attendance_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.users(id),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  status TEXT DEFAULT 'present',
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. MEAL LOGS
CREATE TABLE public.meal_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.users(id),
  meal_type TEXT NOT NULL,
  amount_eaten TEXT,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. NAP LOGS
CREATE TABLE public.nap_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  quality TEXT,
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. INCIDENT REPORTS
CREATE TABLE public.incident_reports (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.users(id),
  incident_type TEXT NOT NULL,
  severity TEXT DEFAULT 'low',
  description TEXT NOT NULL,
  action_taken TEXT,
  parent_notified BOOLEAN DEFAULT false,
  occurred_at TIMESTAMPTZ DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. DAILY ACTIVITIES
CREATE TABLE public.daily_activities (
  id BIGSERIAL PRIMARY KEY,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. MESSAGES
CREATE TABLE public.messages (
  id BIGSERIAL PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  recipient_id UUID REFERENCES public.users(id),
  classroom_id BIGINT REFERENCES public.classrooms(id),
  subject TEXT,
  body TEXT NOT NULL,
  message_type TEXT DEFAULT 'direct',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. AUDIT LOGS
CREATE TABLE public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  school_id UUID REFERENCES public.schools(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CREATE INDEXES
CREATE INDEX classrooms_school_idx ON public.classrooms(school_id);
CREATE INDEX children_school_idx ON public.children(school_id);
CREATE INDEX children_classroom_idx ON public.children(classroom_id);
CREATE INDEX teacher_classroom_teacher_idx ON public.teacher_classroom(teacher_id);
CREATE INDEX teacher_classroom_classroom_idx ON public.teacher_classroom(classroom_id);
CREATE INDEX parent_child_parent_idx ON public.parent_child(parent_id);
CREATE INDEX parent_child_child_idx ON public.parent_child(child_id);
CREATE INDEX attendance_child_idx ON public.attendance_logs(child_id);
CREATE INDEX attendance_date_idx ON public.attendance_logs(date);
CREATE INDEX meal_logs_child_idx ON public.meal_logs(child_id);
CREATE INDEX nap_logs_child_idx ON public.nap_logs(child_id);
CREATE INDEX incidents_child_idx ON public.incident_reports(child_id);
CREATE INDEX activities_classroom_idx ON public.daily_activities(classroom_id);
CREATE INDEX messages_sender_idx ON public.messages(sender_id);
CREATE INDEX messages_recipient_idx ON public.messages(recipient_id);

-- VERIFY
SELECT '✅ ALL TABLES CREATED!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;
