-- ============================================================
-- SEED DATA - Sample School Data for Testing
-- ============================================================
-- Run this AFTER COMPLETE_RESET.sql to populate with test data
-- ============================================================

-- Insert a test school
INSERT INTO public.schools (id, name, address, city, state, country, phone, email, school_type, status)
VALUES (
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'Sunrise Daycare',
  '123 Main Street',
  'Johannesburg',
  'Gauteng',
  'South Africa',
  '+27 11 123 4567',
  'info@sunrisedaycare.co.za',
  'daycare',
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Insert test principal (you'll need to create this user in Supabase Auth first)
-- After creating the auth user, update this with their actual UUID
INSERT INTO public.users (id, school_id, email, name, role, status)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,  -- Replace with actual auth user ID
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'principal@sunrisedaycare.co.za',
  'Principal Sarah Johnson',
  'PRINCIPAL',
  'active'
) ON CONFLICT (id) DO UPDATE SET
  school_id = EXCLUDED.school_id,
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Insert test teacher
INSERT INTO public.users (id, school_id, email, name, role, status)
VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,  -- Replace with actual auth user ID
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'teacher@sunrisedaycare.co.za',
  'Teacher Emily Brown',
  'TEACHER',
  'active'
) ON CONFLICT (id) DO UPDATE SET
  school_id = EXCLUDED.school_id,
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Insert test parent
INSERT INTO public.users (id, school_id, email, name, role, status)
VALUES (
  '00000000-0000-0000-0000-000000000003'::uuid,  -- Replace with actual auth user ID
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'parent@example.com',
  'Parent John Smith',
  'PARENT',
  'active'
) ON CONFLICT (id) DO UPDATE SET
  school_id = EXCLUDED.school_id,
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Insert test classrooms
INSERT INTO public.classrooms (id, school_id, name, age_group, capacity, status)
VALUES 
  (1, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Sunflower Room', '2-3 years', 15, 'active'),
  (2, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Rainbow Room', '3-4 years', 18, 'active'),
  (3, 'a0000000-0000-0000-0000-000000000001'::uuid, 'Star Room', '4-5 years', 20, 'active')
ON CONFLICT (id) DO NOTHING;

-- Assign teacher to classroom
INSERT INTO public.teacher_classroom (teacher_id, classroom_id, school_id, is_primary)
VALUES (
  '00000000-0000-0000-0000-000000000002'::uuid,
  1,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  true
) ON CONFLICT (teacher_id, classroom_id) DO NOTHING;

-- Insert test children
INSERT INTO public.children (id, school_id, classroom_id, first_name, last_name, date_of_birth, gender, status)
VALUES 
  (1, 'a0000000-0000-0000-0000-000000000001'::uuid, 1, 'Emma', 'Smith', '2022-05-15', 'Female', 'active'),
  (2, 'a0000000-0000-0000-0000-000000000001'::uuid, 1, 'Oliver', 'Johnson', '2022-03-22', 'Male', 'active'),
  (3, 'a0000000-0000-0000-0000-000000000001'::uuid, 1, 'Sophia', 'Williams', '2022-07-10', 'Female', 'active'),
  (4, 'a0000000-0000-0000-0000-000000000001'::uuid, 2, 'Liam', 'Brown', '2021-09-08', 'Male', 'active'),
  (5, 'a0000000-0000-0000-0000-000000000001'::uuid, 2, 'Ava', 'Jones', '2021-11-30', 'Female', 'active')
ON CONFLICT (id) DO NOTHING;

-- Link parent to child
INSERT INTO public.parent_child (parent_id, child_id, school_id, relationship, is_primary_contact, can_pickup)
VALUES (
  '00000000-0000-0000-0000-000000000003'::uuid,
  1,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  'parent',
  true,
  true
) ON CONFLICT (parent_id, child_id) DO NOTHING;

-- Insert today's attendance
INSERT INTO public.attendance_logs (child_id, classroom_id, school_id, recorded_by, date, status, check_in_time)
VALUES 
  (1, 1, 'a0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE, 'PRESENT', now() - interval '2 hours'),
  (2, 1, 'a0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE, 'PRESENT', now() - interval '1.5 hours'),
  (3, 1, 'a0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE, 'ABSENT', NULL),
  (4, 2, 'a0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE, 'PRESENT', now() - interval '2.5 hours'),
  (5, 2, 'a0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE, 'PRESENT', now() - interval '3 hours')
ON CONFLICT (child_id, date) DO NOTHING;

-- Insert meal logs
INSERT INTO public.meal_logs (child_id, classroom_id, school_id, logged_by, date, meal_type, amount_eaten, notes)
VALUES 
  (1, 1, 'a0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE, 'breakfast', 'all', 'Enjoyed porridge'),
  (2, 1, 'a0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE, 'breakfast', 'most', NULL),
  (1, 1, 'a0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE, 'morning_snack', 'all', 'Banana and crackers'),
  (4, 2, 'a0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE, 'breakfast', 'some', 'Ate slowly'),
  (5, 2, 'a0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE, 'breakfast', 'all', NULL);

-- Insert nap logs
INSERT INTO public.nap_logs (child_id, classroom_id, school_id, logged_by, date, start_time, end_time, quality)
VALUES 
  (1, 1, 'a0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE, now() - interval '3 hours', now() - interval '1.5 hours', 'excellent'),
  (2, 1, 'a0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE, now() - interval '3 hours', now() - interval '1 hour', 'good');

-- Insert an incident report
INSERT INTO public.incident_reports (child_id, classroom_id, school_id, reported_by, incident_type, severity, description, action_taken, parent_notified, status, occurred_at, date)
VALUES (
  2,
  1,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  'injury',
  'low',
  'Minor scrape on knee during outdoor play',
  'Cleaned wound and applied bandage. Child comforted.',
  true,
  'pending',
  now() - interval '4 hours',
  CURRENT_DATE
);

-- Insert a daily activity
INSERT INTO public.daily_activities (classroom_id, school_id, created_by, activity_type, title, description, date)
VALUES (
  1,
  'a0000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000002'::uuid,
  'art',
  'Finger Painting',
  'Children explored color mixing with finger paints',
  CURRENT_DATE
);

SELECT '✅ Seed data inserted successfully!' as status,
       (SELECT count(*) FROM public.schools) as schools,
       (SELECT count(*) FROM public.users) as users,
       (SELECT count(*) FROM public.classrooms) as classrooms,
       (SELECT count(*) FROM public.children) as children,
       (SELECT count(*) FROM public.attendance_logs) as attendance_records;
