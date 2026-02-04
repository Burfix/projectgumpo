-- Allow PRINCIPAL and ADMIN to read school-scoped data
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'children') THEN
    ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'children' AND policyname = 'principal_read_children'
    ) THEN
      CREATE POLICY principal_read_children ON public.children
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.role = 'SUPER_ADMIN' OR (u.role IN ('ADMIN', 'PRINCIPAL') AND u.school_id = children.school_id))
          )
        );
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'classrooms') THEN
    ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'classrooms' AND policyname = 'principal_read_classrooms'
    ) THEN
      CREATE POLICY principal_read_classrooms ON public.classrooms
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.role = 'SUPER_ADMIN' OR (u.role IN ('ADMIN', 'PRINCIPAL') AND u.school_id = classrooms.school_id))
          )
        );
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'principal_read_users'
    ) THEN
      CREATE POLICY principal_read_users ON public.users
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.role = 'SUPER_ADMIN' OR (u.role IN ('ADMIN', 'PRINCIPAL') AND u.school_id = users.school_id))
          )
        );
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_classroom') THEN
    ALTER TABLE public.teacher_classroom ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'teacher_classroom' AND policyname = 'principal_read_teacher_classroom'
    ) THEN
      CREATE POLICY principal_read_teacher_classroom ON public.teacher_classroom
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.role = 'SUPER_ADMIN' OR (u.role IN ('ADMIN', 'PRINCIPAL') AND u.school_id = teacher_classroom.school_id))
          )
        );
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incident_reports') THEN
    ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'incident_reports' AND policyname = 'principal_read_incidents'
    ) THEN
      CREATE POLICY principal_read_incidents ON public.incident_reports
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.role = 'SUPER_ADMIN' OR (u.role IN ('ADMIN', 'PRINCIPAL') AND u.school_id = incident_reports.school_id))
          )
        );
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance_logs') THEN
    ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'attendance_logs' AND policyname = 'principal_read_attendance'
    ) THEN
      CREATE POLICY principal_read_attendance ON public.attendance_logs
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.role = 'SUPER_ADMIN' OR (u.role IN ('ADMIN', 'PRINCIPAL') AND u.school_id = attendance_logs.school_id))
          )
        );
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_events') THEN
    ALTER TABLE public.app_events ENABLE ROW LEVEL SECURITY;
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'app_events' AND policyname = 'principal_read_app_events'
    ) THEN
      CREATE POLICY principal_read_app_events ON public.app_events
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid()
              AND (u.role = 'SUPER_ADMIN' OR (u.role IN ('ADMIN', 'PRINCIPAL') AND u.school_id = app_events.school_id))
          )
        );
    END IF;
  END IF;
END $$;

-- Performance indexes for dashboard queries
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'children') THEN
    CREATE INDEX IF NOT EXISTS children_school_classroom_idx ON public.children(school_id, classroom_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    CREATE INDEX IF NOT EXISTS users_school_role_idx ON public.users(school_id, role);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'incident_reports') THEN
    CREATE INDEX IF NOT EXISTS incidents_school_created_idx ON public.incident_reports(school_id, created_at);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance_logs') THEN
    CREATE INDEX IF NOT EXISTS attendance_school_created_idx ON public.attendance_logs(school_id, created_at);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'app_events') THEN
    CREATE INDEX IF NOT EXISTS app_events_school_type_created_idx ON public.app_events(school_id, event_type, created_at);
  END IF;
END $$;
