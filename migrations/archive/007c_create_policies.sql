-- PART 3: Enable RLS and create policies
-- Run this AFTER 007b_create_tables.sql succeeds

-- ===========================================
-- ENABLE RLS ON ALL TABLES
-- ===========================================
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_classroom ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nap_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_child ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- CLASSROOMS POLICIES
-- ===========================================
DROP POLICY IF EXISTS "classrooms_select" ON public.classrooms;
CREATE POLICY "classrooms_select" ON public.classrooms
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "classrooms_insert" ON public.classrooms;
CREATE POLICY "classrooms_insert" ON public.classrooms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = classrooms.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

DROP POLICY IF EXISTS "classrooms_update" ON public.classrooms;
CREATE POLICY "classrooms_update" ON public.classrooms
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = classrooms.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

-- ===========================================
-- TEACHER-CLASSROOM POLICIES
-- ===========================================
DROP POLICY IF EXISTS "teacher_classroom_select" ON public.teacher_classroom;
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

DROP POLICY IF EXISTS "teacher_classroom_insert" ON public.teacher_classroom;
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

-- ===========================================
-- ATTENDANCE POLICIES
-- ===========================================
DROP POLICY IF EXISTS "attendance_select" ON public.attendance_logs;
CREATE POLICY "attendance_select" ON public.attendance_logs
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.parent_child pc
      WHERE pc.parent_id = auth.uid() AND pc.child_id = attendance_logs.child_id
    )
  );

DROP POLICY IF EXISTS "attendance_insert" ON public.attendance_logs;
CREATE POLICY "attendance_insert" ON public.attendance_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = attendance_logs.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
  );

DROP POLICY IF EXISTS "attendance_update" ON public.attendance_logs;
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

-- ===========================================
-- MEAL LOGS POLICIES
-- ===========================================
DROP POLICY IF EXISTS "meal_logs_select" ON public.meal_logs;
CREATE POLICY "meal_logs_select" ON public.meal_logs
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.parent_child pc
      WHERE pc.parent_id = auth.uid() AND pc.child_id = meal_logs.child_id
    )
  );

DROP POLICY IF EXISTS "meal_logs_insert" ON public.meal_logs;
CREATE POLICY "meal_logs_insert" ON public.meal_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = meal_logs.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
  );

-- ===========================================
-- NAP LOGS POLICIES
-- ===========================================
DROP POLICY IF EXISTS "nap_logs_select" ON public.nap_logs;
CREATE POLICY "nap_logs_select" ON public.nap_logs
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.parent_child pc
      WHERE pc.parent_id = auth.uid() AND pc.child_id = nap_logs.child_id
    )
  );

DROP POLICY IF EXISTS "nap_logs_insert" ON public.nap_logs;
CREATE POLICY "nap_logs_insert" ON public.nap_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = nap_logs.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
  );

DROP POLICY IF EXISTS "nap_logs_update" ON public.nap_logs;
CREATE POLICY "nap_logs_update" ON public.nap_logs
  FOR UPDATE USING (
    logged_by = auth.uid()
  );

-- ===========================================
-- INCIDENT REPORTS POLICIES
-- ===========================================
DROP POLICY IF EXISTS "incidents_select" ON public.incident_reports;
CREATE POLICY "incidents_select" ON public.incident_reports
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.parent_child pc
      WHERE pc.parent_id = auth.uid() AND pc.child_id = incident_reports.child_id
    )
  );

DROP POLICY IF EXISTS "incidents_insert" ON public.incident_reports;
CREATE POLICY "incidents_insert" ON public.incident_reports
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = incident_reports.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
  );

DROP POLICY IF EXISTS "incidents_update" ON public.incident_reports;
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

-- ===========================================
-- DAILY ACTIVITIES POLICIES
-- ===========================================
DROP POLICY IF EXISTS "activities_select" ON public.daily_activities;
CREATE POLICY "activities_select" ON public.daily_activities
  FOR SELECT USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "activities_insert" ON public.daily_activities;
CREATE POLICY "activities_insert" ON public.daily_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = daily_activities.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
  );

-- ===========================================
-- PARENT-CHILD POLICIES
-- ===========================================
DROP POLICY IF EXISTS "parent_child_select" ON public.parent_child;
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

DROP POLICY IF EXISTS "parent_child_insert" ON public.parent_child;
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

-- ===========================================
-- MESSAGES POLICIES
-- ===========================================
DROP POLICY IF EXISTS "messages_select" ON public.messages;
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    sender_id = auth.uid()
    OR recipient_id = auth.uid()
    OR (is_announcement = true AND school_id IN (
      SELECT school_id FROM public.users WHERE id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid())
  );

-- ===========================================
-- SUCCESS
-- ===========================================
SELECT 'All RLS policies created successfully!' as status;
