-- Create Admin User: thami@sinceeventsmanangement.com
-- This bypasses the Supabase UI and creates the user + profile directly

-- Step 1: Create user in users table (if doesn't exist in auth.users yet)
-- First, you need to create the auth user manually in Supabase:
-- Go to Authentication > Users > Add User (email + auto-generate password)
-- Then run this script to create the profile

-- Method 1: If you already created the auth user, link the profile
INSERT INTO users (id, email, name, role, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'thami@sinceeventsmanangement.com'),
  'thami@sinceeventsmanangement.com',
  'Thami Admin',
  'ADMIN',
  now()
)
ON CONFLICT (id) DO UPDATE
SET role = 'ADMIN',
    name = 'Thami Admin';

-- Verify the user was created
SELECT 
  'Auth User' as type,
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'thami@sinceeventsmanangement.com'

UNION ALL

SELECT 
  'Users Profile' as type,
  id::text,
  email,
  created_at::text,
  role as email_confirmed_at
FROM users
WHERE email = 'thami@sinceeventsmanangement.com';


-- Alternative: Create both auth user AND profile using Supabase Admin API
-- This requires Supabase service role key
-- You can use the Supabase CLI or API:
-- 
-- curl -X POST 'https://YOUR_PROJECT.supabase.co/auth/v1/admin/users' \
-- -H "apikey: YOUR_SERVICE_ROLE_KEY" \
-- -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
-- -H "Content-Type: application/json" \
-- -d '{
--   "email": "thami@sinceeventsmanangement.com",
--   "email_confirm": true,
--   "user_metadata": {
--     "name": "Thami Admin"
--   }
-- }'
