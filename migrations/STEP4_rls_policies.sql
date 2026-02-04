-- ============================================================
-- STEP 4: RLS POLICIES
-- ============================================================

-- Enable RLS on all tables
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
-- CLASSROOMS POLICIES
-- ============================================================
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

-- ============================================================
-- CHILDREN POLICIES
-- ============================================================
CREATE POLICY "children_select_staff" ON public.children
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.users 
      WHERE id = auth.uid() 
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
  );

CREATE POLICY "children_select_parent" ON public.children
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_child 
      WHERE parent_id = auth.uid() AND child_id = children.id
    )
  );

CREATE POLICY "children_insert" ON public.children
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = children.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

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
CREATE POLICY "teacher_classroom_select" ON public.teacher_classroom
  FOR SELECT USING (
    teacher_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.classrooms c ON c.school_id = u.school_id
      WHERE u.id = auth.uid() AND c.id = teacher_classroom.classroom_id
    )
  );

CREATE POLICY "teacher_classroom_manage" ON public.teacher_classroom
  FOR ALL USING (
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
CREATE POLICY "parent_child_select" ON public.parent_child
  FOR SELECT USING (
    parent_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.children c ON c.school_id = u.school_id
      WHERE u.id = auth.uid() AND c.id = parent_child.child_id
    )
  );

CREATE POLICY "parent_child_manage" ON public.parent_child
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users u
      JOIN public.children c ON c.school_id = u.school_id
      WHERE u.id = auth.uid() 
      AND c.id = parent_child.child_id
      AND u.role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL')
    )
  );

-- ============================================================
-- ATTENDANCE POLICIES
-- ============================================================
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

CREATE POLICY "attendance_insert" ON public.attendance_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND school_id = attendance_logs.school_id
      AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
    )
  );

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

CREATE POLICY "nap_logs_update" ON public.nap_logs
  FOR UPDATE USING (logged_by = auth.uid());

-- ============================================================
-- INCIDENT REPORTS POLICIES
-- ============================================================
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

-- ============================================================
-- MESSAGES POLICIES
-- ============================================================
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

-- ============================================================
-- AUDIT LOGS POLICIES
-- ============================================================
CREATE POLICY "audit_logs_select" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

CREATE POLICY "audit_logs_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- DONE
-- ============================================================
SELECT '✅ ALL RLS POLICIES CREATED!' as status;

-- Show all policies
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
