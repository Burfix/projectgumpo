-- Quick verification query - Run this to confirm test data exists
SELECT 
  'Parent User' as item,
  u.email,
  u.name,
  u.role
FROM users u
WHERE u.email = 'parent@test.com'

UNION ALL

SELECT 
  'Child',
  c.first_name || ' ' || c.last_name as email,
  'Age: ' || EXTRACT(YEAR FROM AGE(c.date_of_birth))::text as name,
  c.status as role
FROM children c
WHERE c.first_name = 'Emma'

UNION ALL

SELECT 
  'Parent-Child Link',
  pc.relationship as email,
  'Linked' as name,
  '' as role
FROM parent_child pc
JOIN users u ON pc.parent_id = u.id
WHERE u.email = 'parent@test.com'

UNION ALL

SELECT 
  'Today Attendance',
  al.status as email,
  to_char(al.check_in_time, 'HH24:MI') as name,
  '' as role
FROM attendance_logs al
JOIN children c ON al.child_id = c.id
WHERE c.first_name = 'Emma' AND al.date = CURRENT_DATE

UNION ALL

SELECT 
  'Today Meals',
  COUNT(*)::text as email,
  'meals logged' as name,
  '' as role
FROM meal_logs ml
JOIN children c ON ml.child_id = c.id
WHERE c.first_name = 'Emma' AND ml.date = CURRENT_DATE

UNION ALL

SELECT 
  'Today Naps',
  COUNT(*)::text as email,
  'naps logged' as name,
  '' as role
FROM nap_logs nl
JOIN children c ON nl.child_id = c.id
WHERE c.first_name = 'Emma' AND nl.date = CURRENT_DATE;
