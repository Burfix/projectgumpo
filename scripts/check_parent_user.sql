-- Check what user is logged in and their role
SELECT 
  'Auth User' as type,
  email,
  id as user_id,
  created_at
FROM auth.users
WHERE email = 'parent@test.com'

UNION ALL

SELECT 
  'Users Table' as type,
  email,
  id::text as user_id,
  role as created_at
FROM users
WHERE email = 'parent@test.com'

UNION ALL

SELECT 
  'Linked Children' as type,
  c.first_name || ' ' || c.last_name as email,
  pc.parent_id::text as user_id,
  pc.relationship as created_at
FROM parent_child pc
JOIN children c ON pc.child_id = c.id
JOIN users u ON pc.parent_id = u.id
WHERE u.email = 'parent@test.com';
