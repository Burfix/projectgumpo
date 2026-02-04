-- ============================================================
-- COMPLETE DATABASE RESET - Full Schema Rebuild
-- ============================================================
-- This drops ALL custom tables and recreates them with complete schema
-- ============================================================

-- STEP 1: Drop ALL RLS policies
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
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
    END LOOP;
END $$;

-- STEP 3: Drop ALL custom tables (keep auth/Supabase tables)
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
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.invites CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.schools CASCADE;

-- ============================================================
-- RECREATE ALL TABLES WITH COMPLETE SCHEMA
-- ============================================================

-- 1. SCHOOLS TABLE
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'South Africa',
  phone TEXT,
  email TEXT,
  school_type TEXT DEFAULT 'daycare' CHECK (school_type IN ('daycare', 'preschool', 'aftercare', 'creche')),
  max_children INTEGER DEFAULT 50,
  timezone TEXT DEFAULT 'Africa/Johannesburg',
  settings JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial', 'inactive')),
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. USERS TABLE
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'PRINCIPAL', 'ADMIN', 'TEACHER', 'PARENT')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. INVITES TABLE
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('PRINCIPAL', 'ADMIN', 'TEACHER', 'PARENT')),
  invited_by UUID REFERENCES public.users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. SUBSCRIPTIONS TABLE
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. INVOICES TABLE
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount_due DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'ZAR',
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CLASSROOMS TABLE
CREATE TABLE public.classrooms (
  id BIGSERIAL PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age_group TEXT,
  capacity INTEGER DEFAULT 20,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. CHILDREN TABLE
CREATE TABLE public.children (
  id BIGSERIAL PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT,
  allergies TEXT,
  medical_notes TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. TEACHER_CLASSROOM (junction table)
CREATE TABLE public.teacher_classroom (
  id BIGSERIAL PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(teacher_id, classroom_id)
);

-- 9. PARENT_CHILD (junction table)
CREATE TABLE public.parent_child (
  id BIGSERIAL PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent',
  is_primary_contact BOOLEAN DEFAULT false,
  can_pickup BOOLEAN DEFAULT true,
  linked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

-- 10. ATTENDANCE_LOGS TABLE
CREATE TABLE public.attendance_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES public.users(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(child_id, date)
);

-- 11. MEAL_LOGS TABLE
CREATE TABLE public.meal_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.users(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner')),
  amount_eaten TEXT CHECK (amount_eaten IN ('all', 'most', 'some', 'little', 'none', 'refused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. NAP_LOGS TABLE
CREATE TABLE public.nap_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.users(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  quality TEXT CHECK (quality IN ('excellent', 'good', 'fair', 'poor', 'restless')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. INCIDENT_REPORTS TABLE
CREATE TABLE public.incident_reports (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.users(id),
  incident_type TEXT NOT NULL CHECK (incident_type IN ('injury', 'illness', 'behavioral', 'accident', 'other')),
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  action_taken TEXT,
  parent_notified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.users(id),
  occurred_at TIMESTAMPTZ DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. DAILY_ACTIVITIES TABLE
CREATE TABLE public.daily_activities (
  id BIGSERIAL PRIMARY KEY,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('art', 'music', 'outdoor', 'story', 'learning', 'free_play', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. MESSAGES TABLE
CREATE TABLE public.messages (
  id BIGSERIAL PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  recipient_id UUID REFERENCES public.users(id),
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('direct', 'classroom', 'announcement')),
  subject TEXT,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. AUDIT_LOGS TABLE
CREATE TABLE public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_users_school_id ON public.users(school_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

CREATE INDEX idx_classrooms_school_id ON public.classrooms(school_id);
CREATE INDEX idx_children_school_id ON public.children(school_id);
CREATE INDEX idx_children_classroom_id ON public.children(classroom_id);

CREATE INDEX idx_teacher_classroom_teacher_id ON public.teacher_classroom(teacher_id);
CREATE INDEX idx_teacher_classroom_classroom_id ON public.teacher_classroom(classroom_id);
CREATE INDEX idx_teacher_classroom_school_id ON public.teacher_classroom(school_id);

CREATE INDEX idx_parent_child_parent_id ON public.parent_child(parent_id);
CREATE INDEX idx_parent_child_child_id ON public.parent_child(child_id);
CREATE INDEX idx_parent_child_school_id ON public.parent_child(school_id);

CREATE INDEX idx_attendance_logs_child_id ON public.attendance_logs(child_id);
CREATE INDEX idx_attendance_logs_school_id ON public.attendance_logs(school_id);
CREATE INDEX idx_attendance_logs_date ON public.attendance_logs(date);

CREATE INDEX idx_meal_logs_child_id ON public.meal_logs(child_id);
CREATE INDEX idx_meal_logs_school_id ON public.meal_logs(school_id);
CREATE INDEX idx_meal_logs_date ON public.meal_logs(date);

CREATE INDEX idx_nap_logs_child_id ON public.nap_logs(child_id);
CREATE INDEX idx_nap_logs_school_id ON public.nap_logs(school_id);
CREATE INDEX idx_nap_logs_date ON public.nap_logs(date);

CREATE INDEX idx_incident_reports_child_id ON public.incident_reports(child_id);
CREATE INDEX idx_incident_reports_school_id ON public.incident_reports(school_id);
CREATE INDEX idx_incident_reports_date ON public.incident_reports(date);
CREATE INDEX idx_incident_reports_status ON public.incident_reports(status);

CREATE INDEX idx_messages_school_id ON public.messages(school_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);

CREATE INDEX idx_audit_logs_school_id ON public.audit_logs(school_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classroom ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nap_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- CREATE RLS POLICIES
-- ============================================================

-- SCHOOLS POLICIES
CREATE POLICY "Users can view their own school" ON public.schools
  FOR SELECT USING (
    id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Super admins can view all schools" ON public.schools
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

CREATE POLICY "Super admins can insert schools" ON public.schools
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

CREATE POLICY "Principals and super admins can update their school" ON public.schools
  FOR UPDATE USING (
    id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('PRINCIPAL', 'SUPER_ADMIN'))
  );

-- USERS POLICIES
CREATE POLICY "Users can view users in their school" ON public.users
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

CREATE POLICY "Admins can insert users in their school" ON public.users
  FOR INSERT WITH CHECK (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'))
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

CREATE POLICY "Admins can update users in their school" ON public.users
  FOR UPDATE USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'))
    OR id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

-- CLASSROOMS POLICIES
CREATE POLICY "Users can view classrooms in their school" ON public.classrooms
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can insert classrooms" ON public.classrooms
  FOR INSERT WITH CHECK (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'PRINCIPAL'))
  );

CREATE POLICY "Admins can update classrooms" ON public.classrooms
  FOR UPDATE USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'PRINCIPAL'))
  );

-- CHILDREN POLICIES
CREATE POLICY "Users can view children in their school" ON public.children
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins and teachers can insert children" ON public.children
  FOR INSERT WITH CHECK (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'PRINCIPAL', 'TEACHER'))
  );

CREATE POLICY "Admins and teachers can update children" ON public.children
  FOR UPDATE USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'PRINCIPAL', 'TEACHER'))
  );

-- TEACHER_CLASSROOM POLICIES
CREATE POLICY "Users can view teacher assignments in their school" ON public.teacher_classroom
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage teacher assignments" ON public.teacher_classroom
  FOR ALL USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'PRINCIPAL'))
  );

-- PARENT_CHILD POLICIES
CREATE POLICY "Users can view parent-child links in their school" ON public.parent_child
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage parent-child links" ON public.parent_child
  FOR ALL USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'PRINCIPAL'))
  );

-- ATTENDANCE_LOGS POLICIES
CREATE POLICY "Users can view attendance in their school" ON public.attendance_logs
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Teachers can log attendance" ON public.attendance_logs
  FOR INSERT WITH CHECK (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('TEACHER', 'ADMIN', 'PRINCIPAL'))
  );

CREATE POLICY "Teachers can update attendance" ON public.attendance_logs
  FOR UPDATE USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('TEACHER', 'ADMIN', 'PRINCIPAL'))
  );

-- MEAL_LOGS POLICIES
CREATE POLICY "Users can view meals in their school" ON public.meal_logs
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Teachers can log meals" ON public.meal_logs
  FOR INSERT WITH CHECK (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('TEACHER', 'ADMIN', 'PRINCIPAL'))
  );

CREATE POLICY "Teachers can update meals" ON public.meal_logs
  FOR UPDATE USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('TEACHER', 'ADMIN', 'PRINCIPAL'))
  );

-- NAP_LOGS POLICIES
CREATE POLICY "Users can view naps in their school" ON public.nap_logs
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Teachers can log naps" ON public.nap_logs
  FOR INSERT WITH CHECK (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('TEACHER', 'ADMIN', 'PRINCIPAL'))
  );

CREATE POLICY "Teachers can update naps" ON public.nap_logs
  FOR UPDATE USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('TEACHER', 'ADMIN', 'PRINCIPAL'))
  );

-- INCIDENT_REPORTS POLICIES
CREATE POLICY "Users can view incidents in their school" ON public.incident_reports
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Teachers can report incidents" ON public.incident_reports
  FOR INSERT WITH CHECK (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('TEACHER', 'ADMIN', 'PRINCIPAL'))
  );

CREATE POLICY "Teachers and admins can update incidents" ON public.incident_reports
  FOR UPDATE USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('TEACHER', 'ADMIN', 'PRINCIPAL'))
  );

-- DAILY_ACTIVITIES POLICIES
CREATE POLICY "Users can view activities in their school" ON public.daily_activities
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Teachers can create activities" ON public.daily_activities
  FOR INSERT WITH CHECK (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('TEACHER', 'ADMIN', 'PRINCIPAL'))
  );

CREATE POLICY "Teachers can update their activities" ON public.daily_activities
  FOR UPDATE USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('TEACHER', 'ADMIN', 'PRINCIPAL'))
  );

-- MESSAGES POLICIES
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
    AND (sender_id = auth.uid() OR recipient_id = auth.uid() OR message_type = 'announcement')
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
    AND sender_id = auth.uid()
  );

CREATE POLICY "Recipients can update their messages" ON public.messages
  FOR UPDATE USING (
    recipient_id = auth.uid()
  );

-- AUDIT_LOGS POLICIES
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'))
  );

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- COMPLETION MESSAGE
-- ============================================================

SELECT 'Database reset complete! All tables recreated with full schema and RLS policies.' as status;
