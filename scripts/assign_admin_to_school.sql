-- Assign Admin User to a School
-- This fixes the "User not associated with a school" error

-- Step 1: Create a test school (if you don't have one)
INSERT INTO schools (name, created_at, updated_at)
VALUES ('Pebblestones', NOW(), NOW())
ON CONFLICT DO NOTHING
RETURNING id, name;

-- Step 2: Assign the admin user to the school
UPDATE users
SET 
  school_id = (SELECT id FROM schools WHERE name = 'Pebblestones' LIMIT 1),
  updated_at = NOW()
WHERE email = 'thami@snceventsmanagement.com';

-- Step 3: Verify the update
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.school_id,
  s.name as school_name
FROM users u
LEFT JOIN schools s ON s.id = u.school_id
WHERE u.email = 'thami@snceventsmanagement.com';
