-- Create user profile for burfix@gmail.com and link to Emma

-- First, find the auth user ID for burfix@gmail.com
-- Run this to see the auth user ID:
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'burfix@gmail.com';

-- Create the user profile in the users table
-- Replace 'USER_ID_HERE' with the actual ID from above query
INSERT INTO users (id, email, name, role, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'burfix@gmail.com'),
  'burfix@gmail.com',
  'Burfix Admin',
  'SUPER_ADMIN',
  now()
)
ON CONFLICT (id) DO UPDATE
SET role = 'SUPER_ADMIN',
    name = 'Burfix Admin';

-- Link burfix to Emma for parent dashboard testing
INSERT INTO parent_child (parent_id, child_id, relationship)
SELECT 
  u.id,
  c.id,
  'parent'
FROM users u
CROSS JOIN children c
WHERE u.email = 'burfix@gmail.com'
  AND c.first_name = 'Emma'
  AND c.last_name = 'Johnson'
ON CONFLICT (parent_id, child_id) DO NOTHING;

-- Verify the setup
SELECT 
  'User Profile' as check_type,
  u.id,
  u.email,
  u.name,
  u.role
FROM users u
WHERE u.email = 'burfix@gmail.com'

UNION ALL

SELECT 
  'Parent-Child Link' as check_type,
  u.id,
  u.email as parent_email,
  c.first_name || ' ' || c.last_name as child_name,
  pc.relationship as role
FROM parent_child pc
JOIN users u ON pc.parent_id = u.id
JOIN children c ON pc.child_id = c.id
WHERE u.email = 'burfix@gmail.com'
  AND c.first_name = 'Emma';
