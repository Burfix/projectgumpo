-- ============================================================
-- RLS POLICIES - RUN AFTER 008_complete_schema.sql
-- ============================================================
-- This enables Row Level Security on all tables
-- ============================================================

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: Get current user's school_id and role
-- ============================================================
-- We'll reference public.users in all policies

-- ============================================================
-- USERS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_select_same_school" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_insert" ON public.users;

-- Users can see their own profile
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (id = auth.uid());

-- Users can see others in their school (for admins/teachers)
CREATE POLICY "users_select_same_school" ON public.users
  FOR SELECT USING (
    school_id IN (
      SELECT u.school_id FROM public.users u WHERE u.id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Allow insert for new users
CREATE POLICY "users_insert" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================
-- SCHOOLS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "schools_select" ON public.schools;
DROP POLICY IF EXISTS "schools_update" ON public.schools;
DROP POLICY IF EXISTS "schools_insert" ON public.schools;

-- Super admins see all, others see their school
CREATE POLICY "schools_select" ON public.schools
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
    OR id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- Only super admin or school admin can update
CREATE POLICY "schools_update" ON public.schools
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'SUPER_ADMIN' OR (role IN ('ADMIN', 'PRINCIPAL') AND school_id = schools.id))
    )
  );

-- Only super admin can create schools
CREATE POLICY "schools_insert" ON public.schools
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

-- ============================================================
-- CLASSROOMS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "classrooms_select" ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_insert" ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_update" ON public.classrooms;
DROP POLICY IF EXISTS "classrooms_delete" ON public.classrooms;

CREATE POLICY "classrooms_select" ON public.classrooms
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "classrooms_insert" ON public.classrooms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = classrooms.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

CREATE POLICY "classrooms_update" ON public.classrooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = classrooms.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

CREATE POLICY "classrooms_delete" ON public.classrooms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = classrooms.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

-- ============================================================
-- CHILDREN POLICIES
-- ============================================================
DROP POLICY IF EXISTS "children_select_school" ON public.children;
DROP POLICY IF EXISTS "children_select_parent" ON public.children;
DROP POLICY IF EXISTS "children_insert" ON public.children;
DROP POLICY IF EXISTS "children_update" ON public.children;

-- School staff can see all children in their school
CREATE POLICY "children_select_school" ON public.children
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
  );

-- Parents can see their linked children
CREATE POLICY "children_select_parent" ON public.children
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_child 
      WHERE parent_id = auth.uid() AND child_id = children.id
    )
  );

-- Only admin/principal can add children
CREATE POLICY "children_insert" ON public.children
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = children.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

-- Admin/principal can update children
CREATE POLICY "children_update" ON public.children
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = children.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

-- ============================================================
-- TEACHER-CLASSROOM POLICIES
-- ============================================================
DROP POLICY IF EXISTS "teacher_classroom_select" ON public.teacher_classroom;
DROP POLICY IF EXISTS "teacher_classroom_insert" ON public.teacher_classroom;
DROP POLICY IF EXISTS "teacher_classroom_delete" ON public.teacher_classroom;

-- Teachers see their own assignments, admins see all
CREATE POLICY "teacher_classroom_select" ON public.teacher_classroom
  FOR SELECT USING (
    teacher_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.classrooms c ON c.school_id = u.school_id
      WHERE u.id = auth.uid() 
      AND c.id = teacher_classroom.classroom_id
      AND u.role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

CREATE POLICY "teacher_classroom_insert" ON public.teacher_classroom
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.classrooms c ON c.school_id = u.school_id
      WHERE u.id = auth.uid() 
      AND c.id = teacher_classroom.classroom_id
      AND u.role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

CREATE POLICY "teacher_classroom_delete" ON public.teacher_classroom
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.classrooms c ON c.school_id = u.school_id
      WHERE u.id = auth.uid() 
      AND c.id = teacher_classroom.classroom_id
      AND u.role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

-- ============================================================
-- PARENT-CHILD POLICIES
-- ============================================================
DROP POLICY IF EXISTS "parent_child_select" ON public.parent_child;
DROP POLICY IF EXISTS "parent_child_insert" ON public.parent_child;

-- Parents see their own links, staff see all in their school
CREATE POLICY "parent_child_select" ON public.parent_child
  FOR SELECT USING (
    parent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.children c ON c.school_id = u.school_id
      WHERE u.id = auth.uid() 
      AND c.id = parent_child.child_id
      AND u.role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
  );

CREATE POLICY "parent_child_insert" ON public.parent_child
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.children c ON c.school_id = u.school_id
      WHERE u.id = auth.uid() 
      AND c.id = parent_child.child_id
      AND u.role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

-- ============================================================
-- ATTENDANCE LOGS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "attendance_select" ON public.attendance_logs;
DROP POLICY IF EXISTS "attendance_insert" ON public.attendance_logs;
DROP POLICY IF EXISTS "attendance_update" ON public.attendance_logs;

-- Staff see school attendance, parents see their children
CREATE POLICY "attendance_select" ON public.attendance_logs
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.users 
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
    OR EXISTS (
      SELECT 1 FROM public.parent_child pc
      WHERE pc.parent_id = auth.uid() AND pc.child_id = attendance_logs.child_id
    )
  );

-- Teachers and above can log attendance
CREATE POLICY "attendance_insert" ON public.attendance_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = attendance_logs.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
  );

-- Can update own logs or if admin
CREATE POLICY "attendance_update" ON public.attendance_logs
  FOR UPDATE USING (
    logged_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = attendance_logs.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

-- ============================================================
-- MEAL LOGS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "meal_logs_select" ON public.meal_logs;
DROP POLICY IF EXISTS "meal_logs_insert" ON public.meal_logs;

CREATE POLICY "meal_logs_select" ON public.meal_logs
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.users 
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
    OR EXISTS (
      SELECT 1 FROM public.parent_child pc
      WHERE pc.parent_id = auth.uid() AND pc.child_id = meal_logs.child_id
    )
  );

CREATE POLICY "meal_logs_insert" ON public.meal_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = meal_logs.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
  );

-- ============================================================
-- NAP LOGS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "nap_logs_select" ON public.nap_logs;
DROP POLICY IF EXISTS "nap_logs_insert" ON public.nap_logs;
DROP POLICY IF EXISTS "nap_logs_update" ON public.nap_logs;

CREATE POLICY "nap_logs_select" ON public.nap_logs
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.users 
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
    OR EXISTS (
      SELECT 1 FROM public.parent_child pc
      WHERE pc.parent_id = auth.uid() AND pc.child_id = nap_logs.child_id
    )
  );

CREATE POLICY "nap_logs_insert" ON public.nap_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = nap_logs.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
  );

-- Teachers can update their own nap logs (e.g., set end_time)
CREATE POLICY "nap_logs_update" ON public.nap_logs
  FOR UPDATE USING (logged_by = auth.uid());

-- ============================================================
-- INCIDENT REPORTS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "incidents_select" ON public.incident_reports;
DROP POLICY IF EXISTS "incidents_insert" ON public.incident_reports;
DROP POLICY IF EXISTS "incidents_update" ON public.incident_reports;

CREATE POLICY "incidents_select" ON public.incident_reports
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.users 
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
    OR EXISTS (
      SELECT 1 FROM public.parent_child pc
      WHERE pc.parent_id = auth.uid() AND pc.child_id = incident_reports.child_id
    )
  );

CREATE POLICY "incidents_insert" ON public.incident_reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = incident_reports.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
  );

CREATE POLICY "incidents_update" ON public.incident_reports
  FOR UPDATE USING (
    reported_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = incident_reports.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

-- ============================================================
-- DAILY ACTIVITIES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "activities_select" ON public.daily_activities;
DROP POLICY IF EXISTS "activities_insert" ON public.daily_activities;
DROP POLICY IF EXISTS "activities_update" ON public.daily_activities;

CREATE POLICY "activities_select" ON public.daily_activities
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "activities_insert" ON public.daily_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = daily_activities.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
  );

CREATE POLICY "activities_update" ON public.daily_activities
  FOR UPDATE USING (created_by = auth.uid());

-- ============================================================
-- MESSAGES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "messages_select" ON public.messages;
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
DROP POLICY IF EXISTS "messages_update" ON public.messages;

CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid()
    OR recipient_id = auth.uid()
    OR (message_type = 'announcement' AND school_id IN (
      SELECT school_id FROM public.users WHERE id = auth.uid()
    ))
  );

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- Mark as read
CREATE POLICY "messages_update" ON public.messages
  FOR UPDATE USING (recipient_id = auth.uid());

-- ============================================================
-- INVITES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "invites_select" ON public.invites;
DROP POLICY IF EXISTS "invites_insert" ON public.invites;

CREATE POLICY "invites_select" ON public.invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

CREATE POLICY "invites_insert" ON public.invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

-- ============================================================
-- SUBSCRIPTIONS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;

CREATE POLICY "subscriptions_select" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'SUPER_ADMIN' OR school_id = subscriptions.school_id)
    )
  );

-- ============================================================
-- INVOICES POLICIES
-- ============================================================
DROP POLICY IF EXISTS "invoices_select" ON public.invoices;

CREATE POLICY "invoices_select" ON public.invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND (role = 'SUPER_ADMIN' OR (role IN ('ADMIN', 'PRINCIPAL') AND school_id = invoices.school_id))
    )
  );

-- ============================================================
-- AUDIT LOGS POLICIES
-- ============================================================
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON public.audit_logs;

-- Only super admin can view all audit logs
CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- Anyone can insert (for logging)
CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- COMPLETE
-- ============================================================
SELECT 'All RLS policies created successfully!' as status;
