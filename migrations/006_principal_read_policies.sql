-- Allow PRINCIPAL and ADMIN to read school-scoped data
DO $$
BEGIN
  -- Children table - only add PRINCIPAL role if school_id column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'children' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policy if it exists, then recreate to include PRINCIPAL
    DROP POLICY IF EXISTS principal_read_children ON public.children;
    CREATE POLICY principal_read_children ON public.children
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.role = 'SUPER_ADMIN' OR (u.role IN ('ADMIN', 'PRINCIPAL') AND u.school_id = children.school_id))
        )
      );
  END IF;

  -- Classrooms table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'classrooms' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS principal_read_classrooms ON public.classrooms;
    CREATE POLICY principal_read_classrooms ON public.classrooms
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.role = 'SUPER_ADMIN' OR (u.role IN ('ADMIN', 'PRINCIPAL') AND u.school_id = classrooms.school_id))
        )
      );
  END IF;

  -- Users table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS principal_read_users ON public.users;
    CREATE POLICY principal_read_users ON public.users
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.role = 'SUPER_ADMIN' OR (u.role IN ('ADMIN', 'PRINCIPAL') AND u.school_id = users.school_id))
        )
      );
  END IF;

  -- Teacher classroom table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'teacher_classroom' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE public.teacher_classroom ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS principal_read_teacher_classroom ON public.teacher_classroom;
    CREATE POLICY principal_read_teacher_classroom ON public.teacher_classroom
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.role = 'SUPER_ADMIN' OR (u.role IN ('ADMIN', 'PRINCIPAL') AND u.school_id = teacher_classroom.school_id))
        )
      );
  END IF;

  -- Incident reports table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'incident_reports' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS principal_read_incidents ON public.incident_reports;
    CREATE POLICY principal_read_incidents ON public.incident_reports
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.role = 'SUPER_ADMIN' OR (u.role IN ('ADMIN', 'PRINCIPAL') AND u.school_id = incident_reports.school_id))
        )
      );
  END IF;

  -- Attendance logs table
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'attendance_logs' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS principal_read_attendance ON public.attendance_logs;
    CREATE POLICY principal_read_attendance ON public.attendance_logs
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.role = 'SUPER_ADMIN' OR (u.role IN ('ADMIN', 'PRINCIPAL') AND u.school_id = attendance_logs.school_id))
        )
      );
  END IF;

  -- App events table (for parent engagement)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'app_events' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS principal_read_app_events ON public.app_events;
    CREATE POLICY principal_read_app_events ON public.app_events
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.users u
          WHERE u.id = auth.uid()
            AND (u.role = 'SUPER_ADMIN' OR (u.role IN ('ADMIN', 'PRINCIPAL') AND u.school_id = app_events.school_id))
        )
      );
  END IF;
END $$;

-- Performance indexes for dashboard queries
DO $$
BEGIN
  -- Children table: only index on school_id (classroom_id may not exist)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'children' AND column_name = 'school_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS children_school_id_idx ON public.children(school_id);
  END IF;
  
  -- Users table: index school_id and role for role-based queries
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' 
    AND column_name = 'school_id' AND column_name = 'role'
  ) THEN
    CREATE INDEX IF NOT EXISTS users_school_role_idx ON public.users(school_id, role);
  END IF;
  
  -- Incident reports: index for school-scoped date range queries
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'incident_reports' 
    AND column_name = 'school_id' AND column_name = 'created_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS incidents_school_created_idx ON public.incident_reports(school_id, created_at);
  END IF;
  
  -- Attendance logs: index for school-scoped date range queries
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'attendance_logs' 
    AND column_name = 'school_id' AND column_name = 'created_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS attendance_school_created_idx ON public.attendance_logs(school_id, created_at);
  END IF;
  
  -- App events: index for parent engagement tracking
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'app_events' 
    AND column_name = 'school_id' AND column_name = 'event_type' AND column_name = 'created_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS app_events_school_type_created_idx ON public.app_events(school_id, event_type, created_at);
  END IF;
END $$;
