-- ============================================================
-- PARENT DASHBOARD TEST DATA SETUP
-- Run this in Supabase SQL Editor
-- ============================================================

-- Step 1: Create a parent user in the users table
DO $$
DECLARE
  parent_user_id uuid;
  child_id integer;
  classroom_id integer;
  school_id uuid := 'a0000000-0000-0000-0000-000000000001'; -- Default test school
  today date := CURRENT_DATE;
  test_parent_email text := 'parent@test.com';
BEGIN
  -- Check if parent user exists in users table
  SELECT id INTO parent_user_id 
  FROM users 
  WHERE email = test_parent_email;
  
  -- If parent doesn't exist, create one
  IF parent_user_id IS NULL THEN
    INSERT INTO users (id, email, name, role, school_id)
    VALUES (
      gen_random_uuid(),
      test_parent_email,
      'Test Parent',
      'PARENT',
      school_id
    )
    RETURNING id INTO parent_user_id;
    
    RAISE NOTICE 'Created parent user: % (ID: %)', test_parent_email, parent_user_id;
  ELSE
    RAISE NOTICE 'Parent user already exists: % (ID: %)', test_parent_email, parent_user_id;
  END IF;
  
  -- Get or create a classroom
  SELECT id INTO classroom_id FROM classrooms LIMIT 1;
  
  IF classroom_id IS NULL THEN
    INSERT INTO classrooms (school_id, name, age_group, capacity)
    VALUES (school_id, 'Sunshine Room', '3-4 years', 20)
    RETURNING id INTO classroom_id;
    
    RAISE NOTICE 'Created classroom: Sunshine Room (ID: %)', classroom_id;
  END IF;
  
  -- Create a test child
  INSERT INTO children (
    school_id,
    classroom_id,
    first_name,
    last_name,
    date_of_birth,
    gender,
    allergies,
    status
  )
  VALUES (
    school_id,
    classroom_id,
    'Emma',
    'Johnson',
    CURRENT_DATE - INTERVAL '3 years',
    'Female',
    'Peanuts, Tree nuts',
    'active'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO child_id;
  
  -- If child wasn't created (conflict), get existing one
  IF child_id IS NULL THEN
    SELECT id INTO child_id FROM children WHERE first_name = 'Emma' AND last_name = 'Johnson' LIMIT 1;
  END IF;
  
  RAISE NOTICE 'Child created/found: Emma Johnson (ID: %)', child_id;
  
  -- Link parent to child
  INSERT INTO parent_child (parent_id, child_id, relationship)
  VALUES (parent_user_id, child_id, 'mother')
  ON CONFLICT (parent_id, child_id) DO NOTHING;
  
  RAISE NOTICE 'Linked parent to child';
  
  -- Add today's attendance
  INSERT INTO attendance_logs (child_id, date, status, check_in_time, notes)
  VALUES (
    child_id,
    today,
    'present',
    today::timestamp + interval '8 hours',
    'Dropped off by parent'
  )
  ON CONFLICT (child_id, date) DO UPDATE
  SET check_in_time = today::timestamp + interval '8 hours',
      status = 'present';
  
  RAISE NOTICE 'Added attendance for today';
  
  -- Add meal logs
  INSERT INTO meal_logs (child_id, date, meal_type, food_items, amount_eaten, notes, created_at)
  VALUES 
    (child_id, today, 'breakfast', 'Oatmeal with honey and sliced banana', 'all', 'Ate everything!', today::timestamp + interval '8 hours 15 minutes'),
    (child_id, today, 'snack', 'Apple slices and crackers with cheese', 'most', 'Left some crackers', today::timestamp + interval '10 hours'),
    (child_id, today, 'lunch', 'Pasta with vegetables and fruit cup', 'most', 'Good appetite', today::timestamp + interval '12 hours')
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Added 3 meal logs';
  
  -- Add nap log
  INSERT INTO nap_logs (child_id, date, start_time, end_time, quality, notes)
  VALUES (
    child_id,
    today,
    today::timestamp + interval '12 hours 30 minutes',
    today::timestamp + interval '14 hours 15 minutes',
    'good',
    'Slept peacefully, woke up happy'
  )
  ON CONFLICT (child_id, date) DO UPDATE
  SET start_time = today::timestamp + interval '12 hours 30 minutes',
      end_time = today::timestamp + interval '14 hours 15 minutes',
      quality = 'good';
  
  RAISE NOTICE 'Added nap log (1h 45m)';
  
  -- Add some historical data (last 7 days)
  FOR i IN 1..7 LOOP
    -- Attendance
    INSERT INTO attendance_logs (child_id, date, status, check_in_time, check_out_time)
    VALUES (
      child_id,
      today - i,
      'present',
      (today - i)::timestamp + interval '8 hours',
      (today - i)::timestamp + interval '16 hours'
    )
    ON CONFLICT (child_id, date) DO NOTHING;
    
    -- Meals
    INSERT INTO meal_logs (child_id, date, meal_type, food_items, amount_eaten)
    VALUES 
      (child_id, today - i, 'breakfast', 'Various breakfast items', CASE WHEN random() > 0.5 THEN 'all' ELSE 'most' END),
      (child_id, today - i, 'lunch', 'Various lunch items', CASE WHEN random() > 0.5 THEN 'most' ELSE 'some' END)
    ON CONFLICT DO NOTHING;
    
    -- Naps
    INSERT INTO nap_logs (child_id, date, start_time, end_time, quality)
    VALUES (
      child_id,
      today - i,
      (today - i)::timestamp + interval '12 hours 30 minutes',
      (today - i)::timestamp + interval '14 hours',
      CASE WHEN random() > 0.7 THEN 'excellent' WHEN random() > 0.4 THEN 'good' ELSE 'fair' END
    )
    ON CONFLICT (child_id, date) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Added 7 days of historical data';
  
  -- Add a sample message
  INSERT INTO messages (
    sender_id,
    recipient_id,
    subject,
    message,
    message_type,
    is_read,
    created_at
  )
  VALUES (
    (SELECT id FROM users WHERE role = 'TEACHER' LIMIT 1),
    parent_user_id,
    'Emma had a great day today!',
    'Hi! Just wanted to let you know that Emma had a wonderful day today. She participated actively in art class and made a beautiful painting. She also played nicely with her friends during outdoor time. Keep up the great work at home!',
    'direct',
    false,
    NOW()
  )
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'Added sample message';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ TEST DATA SETUP COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Login credentials:';
  RAISE NOTICE '  Email: parent@test.com';
  RAISE NOTICE '  Password: (set in Supabase Auth)';
  RAISE NOTICE '';
  RAISE NOTICE 'Child: Emma Johnson (Age 3)';
  RAISE NOTICE 'Classroom: Sunshine Room';
  RAISE NOTICE 'Data: Today + 7 days history';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create auth user in Supabase Dashboard';
  RAISE NOTICE '   Authentication > Users > Add User';
  RAISE NOTICE '   Email: parent@test.com';
  RAISE NOTICE '   Password: password123 (or your choice)';
  RAISE NOTICE '';
  RAISE NOTICE '2. Visit: http://localhost:3000/dashboard/parent';
  RAISE NOTICE '========================================';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: %', SQLERRM;
    RAISE NOTICE 'Make sure you have the required tables and permissions';
END $$;
