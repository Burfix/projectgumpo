-- ============================================================
-- COMPLETE DATABASE SCHEMA - RUN IN SUPABASE SQL EDITOR
-- ============================================================
-- This migration creates/updates ALL tables with proper relationships
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================================

-- ============================================================
-- STEP 1: CREATE PUBLIC.USERS (Profile table linked to auth.users)
-- ============================================================
-- This is the PROFILE table - NOT the auth table
-- auth.users is managed by Supabase, we link to it

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'PARENT' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT')),
  school_id BIGINT, -- FK added after schools table exists
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns if they don't exist (for existing tables)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'school_id') THEN
    ALTER TABLE public.users ADD COLUMN school_id BIGINT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE public.users ADD COLUMN role TEXT DEFAULT 'PARENT';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'name') THEN
    ALTER TABLE public.users ADD COLUMN name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone') THEN
    ALTER TABLE public.users ADD COLUMN phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'avatar_url') THEN
    ALTER TABLE public.users ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS users_school_id_idx ON public.users(school_id);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);

-- ============================================================
-- STEP 2: SCHOOLS TABLE (Core entity)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.schools (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  city TEXT,
  school_type TEXT DEFAULT 'Preschool' CHECK (school_type IN ('Preschool', 'Crèche', 'Primary', 'Other')),
  principal_name TEXT,
  principal_email TEXT,
  phone_number TEXT,
  subscription_tier TEXT DEFAULT 'Starter' CHECK (subscription_tier IN ('Starter', 'Growth', 'Professional', 'Enterprise')),
  account_status TEXT DEFAULT 'Trial' CHECK (account_status IN ('Trial', 'Active', 'Suspended')),
  child_count INT DEFAULT 0,
  teacher_count INT DEFAULT 0,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to schools
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'city') THEN
    ALTER TABLE public.schools ADD COLUMN city TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'school_type') THEN
    ALTER TABLE public.schools ADD COLUMN school_type TEXT DEFAULT 'Preschool';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'logo_url') THEN
    ALTER TABLE public.schools ADD COLUMN logo_url TEXT;
  END IF;
END $$;

-- Now add FK from users to schools
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_school_id_fkey' AND table_name = 'users'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_school_id_fkey 
      FOREIGN KEY (school_id) REFERENCES public.schools(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================
-- STEP 3: CLASSROOMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.classrooms (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  capacity INTEGER DEFAULT 20,
  age_group TEXT, -- e.g., 'Infants', 'Toddlers', 'Preschool'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS classrooms_school_id_idx ON public.classrooms(school_id);

-- ============================================================
-- STEP 4: CHILDREN TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.children (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  allergies TEXT,
  medical_notes TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  photo_url TEXT,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add classroom_id if it doesn't exist
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

-- ============================================================
-- STEP 5: TEACHER-CLASSROOM JUNCTION TABLE
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

-- ============================================================
-- STEP 6: PARENT-CHILD JUNCTION TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.parent_child (
  id BIGSERIAL PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent' CHECK (relationship IN ('parent', 'guardian', 'grandparent', 'emergency_contact', 'other')),
  is_primary BOOLEAN DEFAULT true,
  can_pickup BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

CREATE INDEX IF NOT EXISTS parent_child_parent_idx ON public.parent_child(parent_id);
CREATE INDEX IF NOT EXISTS parent_child_child_idx ON public.parent_child(child_id);

-- ============================================================
-- STEP 7: ATTENDANCE LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.attendance_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.users(id),
  check_in_time TIMESTAMPTZ,
  check_out_time TIMESTAMPTZ,
  checked_out_by UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused', 'sick')),
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS attendance_child_idx ON public.attendance_logs(child_id);
CREATE INDEX IF NOT EXISTS attendance_date_idx ON public.attendance_logs(date);
CREATE INDEX IF NOT EXISTS attendance_school_idx ON public.attendance_logs(school_id);
CREATE INDEX IF NOT EXISTS attendance_classroom_idx ON public.attendance_logs(classroom_id);

-- ============================================================
-- STEP 8: MEAL LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.users(id),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner')),
  food_items TEXT, -- What was served
  amount_eaten TEXT CHECK (amount_eaten IN ('all', 'most', 'some', 'none', 'refused')),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meal_logs_child_idx ON public.meal_logs(child_id);
CREATE INDEX IF NOT EXISTS meal_logs_date_idx ON public.meal_logs(date);
CREATE INDEX IF NOT EXISTS meal_logs_school_idx ON public.meal_logs(school_id);

-- ============================================================
-- STEP 9: NAP LOGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.nap_logs (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  logged_by UUID NOT NULL REFERENCES public.users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER, -- Calculated when end_time is set
  quality TEXT CHECK (quality IN ('good', 'restless', 'refused', 'woke_early')),
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS nap_logs_child_idx ON public.nap_logs(child_id);
CREATE INDEX IF NOT EXISTS nap_logs_date_idx ON public.nap_logs(date);
CREATE INDEX IF NOT EXISTS nap_logs_school_idx ON public.nap_logs(school_id);

-- ============================================================
-- STEP 10: INCIDENT REPORTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.incident_reports (
  id BIGSERIAL PRIMARY KEY,
  child_id BIGINT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.users(id),
  witnessed_by UUID REFERENCES public.users(id),
  incident_type TEXT NOT NULL CHECK (incident_type IN ('injury', 'behavior', 'health', 'accident', 'bite', 'other')),
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location TEXT, -- Where it happened
  description TEXT NOT NULL,
  action_taken TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  parent_notified BOOLEAN DEFAULT false,
  parent_notified_at TIMESTAMPTZ,
  parent_notified_by UUID REFERENCES public.users(id),
  parent_signature TEXT, -- For acknowledgment
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS incidents_child_idx ON public.incident_reports(child_id);
CREATE INDEX IF NOT EXISTS incidents_date_idx ON public.incident_reports(date);
CREATE INDEX IF NOT EXISTS incidents_school_idx ON public.incident_reports(school_id);
CREATE INDEX IF NOT EXISTS incidents_severity_idx ON public.incident_reports(severity);
CREATE INDEX IF NOT EXISTS incidents_type_idx ON public.incident_reports(incident_type);

-- ============================================================
-- STEP 11: DAILY ACTIVITIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.daily_activities (
  id BIGSERIAL PRIMARY KEY,
  classroom_id BIGINT NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES public.users(id),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('art', 'music', 'outdoor', 'learning', 'play', 'story', 'exercise', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  materials_used TEXT,
  learning_objectives TEXT,
  photos TEXT[], -- Array of photo URLs
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activities_classroom_idx ON public.daily_activities(classroom_id);
CREATE INDEX IF NOT EXISTS activities_date_idx ON public.daily_activities(date);
CREATE INDEX IF NOT EXISTS activities_school_idx ON public.daily_activities(school_id);

-- ============================================================
-- STEP 12: MESSAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  recipient_id UUID REFERENCES public.users(id), -- NULL for announcements
  classroom_id BIGINT REFERENCES public.classrooms(id) ON DELETE SET NULL, -- For classroom announcements
  child_id BIGINT REFERENCES public.children(id) ON DELETE SET NULL, -- For child-specific messages
  subject TEXT,
  body TEXT NOT NULL,
  message_type TEXT DEFAULT 'direct' CHECK (message_type IN ('direct', 'announcement', 'alert', 'reminder')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  attachments TEXT[], -- Array of attachment URLs
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_school_idx ON public.messages(school_id);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_idx ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_classroom_idx ON public.messages(classroom_id);
CREATE INDEX IF NOT EXISTS messages_created_idx ON public.messages(created_at);

-- ============================================================
-- STEP 13: INVITES TABLE (for user invitations)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invites (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'PARENT' CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT')),
  school_id BIGINT REFERENCES public.schools(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES public.users(id),
  token TEXT UNIQUE, -- Invite token
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Set when accepted
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to invites
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invites' AND column_name = 'school_id') THEN
    ALTER TABLE public.invites ADD COLUMN school_id BIGINT REFERENCES public.schools(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invites' AND column_name = 'status') THEN
    ALTER TABLE public.invites ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS invites_email_idx ON public.invites(email);
CREATE INDEX IF NOT EXISTS invites_school_idx ON public.invites(school_id);
CREATE INDEX IF NOT EXISTS invites_token_idx ON public.invites(token);

-- ============================================================
-- STEP 14: SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('Starter', 'Growth', 'Professional', 'Enterprise')),
  monthly_price_zar NUMERIC(10, 2) NOT NULL,
  trial_start_date TIMESTAMPTZ,
  trial_end_date TIMESTAMPTZ,
  billing_status TEXT DEFAULT 'Trial' CHECK (billing_status IN ('Trial', 'Active', 'Past Due', 'Cancelled')),
  auto_renew BOOLEAN DEFAULT true,
  next_billing_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_school_id_idx ON public.subscriptions(school_id);

-- ============================================================
-- STEP 15: INVOICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  subscription_id BIGINT REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  amount_zar NUMERIC(10, 2) NOT NULL,
  invoice_date TIMESTAMPTZ DEFAULT now(),
  due_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Overdue', 'Cancelled')),
  invoice_number TEXT UNIQUE,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoices_school_id_idx ON public.invoices(school_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON public.invoices(status);

-- ============================================================
-- STEP 16: AUDIT LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  school_id BIGINT REFERENCES public.schools(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
  entity_type TEXT NOT NULL, -- 'user', 'child', 'attendance', etc.
  entity_id TEXT, -- ID of affected record
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_idx ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_school_idx ON public.audit_logs(school_id);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON public.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs(action);

-- ============================================================
-- SCHEMA COMPLETE - VERIFY
-- ============================================================
SELECT 'Schema creation complete!' as status;

-- Show all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
