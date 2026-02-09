-- Find all existing SUPER_ADMIN users
SELECT 
  id,
  email,
  name,
  role,
  created_at
FROM users
WHERE role = 'SUPER_ADMIN'
ORDER BY created_at;

-- Also check auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at
LIMIT 10;
