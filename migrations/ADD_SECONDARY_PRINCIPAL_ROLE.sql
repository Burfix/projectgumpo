-- ============================================================
-- ADD SECONDARY_PRINCIPAL ROLE
-- ============================================================
-- Adds SECONDARY_PRINCIPAL as a valid role in the system
-- ============================================================

-- Step 1: Update the users table role constraint to include SECONDARY_PRINCIPAL
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('SUPER_ADMIN', 'PRINCIPAL', 'SECONDARY_PRINCIPAL', 'ADMIN', 'TEACHER', 'PARENT'));

-- Step 2: Update invites table role constraint
ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS invites_role_check;
ALTER TABLE public.invites ADD CONSTRAINT invites_role_check 
  CHECK (role IN ('PRINCIPAL', 'SECONDARY_PRINCIPAL', 'ADMIN', 'TEACHER', 'PARENT'));

-- Step 3: Update RLS policies to include SECONDARY_PRINCIPAL where PRINCIPAL is allowed

-- Update classrooms policies
DROP POLICY IF EXISTS "Admins can insert classrooms" ON public.classrooms;
CREATE POLICY "Admins can insert classrooms" ON public.classrooms
  FOR INSERT WITH CHECK (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'PRINCIPAL', 'SECONDARY_PRINCIPAL'))
  );

DROP POLICY IF EXISTS "Admins can update classrooms" ON public.classrooms;
CREATE POLICY "Admins can update classrooms" ON public.classrooms
  FOR UPDATE USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'PRINCIPAL', 'SECONDARY_PRINCIPAL'))
  );

-- Update children policies
DROP POLICY IF EXISTS "Admins and teachers can insert children" ON public.children;
CREATE POLICY "Admins and teachers can insert children" ON public.children
  FOR INSERT WITH CHECK (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'PRINCIPAL', 'SECONDARY_PRINCIPAL', 'TEACHER'))
  );

DROP POLICY IF EXISTS "Admins and teachers can update children" ON public.children;
CREATE POLICY "Admins and teachers can update children" ON public.children
  FOR UPDATE USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'PRINCIPAL', 'SECONDARY_PRINCIPAL', 'TEACHER'))
  );

-- Update teacher_classroom policies
DROP POLICY IF EXISTS "Admins can manage teacher assignments" ON public.teacher_classroom;
CREATE POLICY "Admins can manage teacher assignments" ON public.teacher_classroom
  FOR ALL USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'PRINCIPAL', 'SECONDARY_PRINCIPAL'))
  );

-- Update parent_child policies
DROP POLICY IF EXISTS "Admins can manage parent-child links" ON public.parent_child;
CREATE POLICY "Admins can manage parent-child links" ON public.parent_child
  FOR ALL USING (
    school_id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('ADMIN', 'PRINCIPAL', 'SECONDARY_PRINCIPAL'))
  );

-- Update schools policy
DROP POLICY IF EXISTS "Principals and super admins can update their school" ON public.schools;
CREATE POLICY "Principals and super admins can update their school" ON public.schools
  FOR UPDATE USING (
    id IN (SELECT school_id FROM public.users WHERE id = auth.uid() AND role IN ('PRINCIPAL', 'SECONDARY_PRINCIPAL', 'SUPER_ADMIN'))
  );

-- Step 4: Add indexes for performance on join tables
CREATE INDEX IF NOT EXISTS idx_teacher_classroom_teacher_school ON public.teacher_classroom(teacher_id, school_id);
CREATE INDEX IF NOT EXISTS idx_parent_child_parent_school ON public.parent_child(parent_id, school_id);

SELECT '✅ SECONDARY_PRINCIPAL role added and RLS policies updated!' as status;
