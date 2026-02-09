-- Bypass Supabase UI and create admin user directly
-- This avoids the "Unexpected end of JSON input" error

-- Step 1: First, create an invite record (optional but good for tracking)
INSERT INTO invites (email, role, name, status, token, expires_at, created_at)
VALUES (
  'thami@snceventsmanagement.com',
  'ADMIN',
  'Thami Admin',
  'pending',
  encode(gen_random_bytes(32), 'hex'),
  NOW() + INTERVAL '7 days',
  NOW()
)
ON CONFLICT DO NOTHING;

-- Step 2: You MUST create the auth user manually in Supabase Dashboard
-- Go to: Authentication > Users > "Add User" (NOT "Invite User")
-- Click the button and fill in:
--   - Email: thami@snceventsmanagement.com
--   - Auto-generate password (or set your own)
--   - Check "Auto Confirm Email"
-- Click "Create User"

-- Step 3: After creating the auth user, run this to create/update the profile
-- The trigger should do this automatically, but run this as backup:
INSERT INTO users (id, email, name, role, created_at)
SELECT 
  au.id,
  au.email,
  'Thami Admin' as name,
  'ADMIN' as role,
  NOW()
FROM auth.users au
WHERE au.email = 'thami@snceventsmanagement.com'
ON CONFLICT (id) DO UPDATE
SET 
  name = 'Thami Admin',
  role = 'ADMIN',
  updated_at = NOW();

-- Step 4: Verify everything is set up correctly
SELECT 
  'Auth User' as type,
  id::text,
  email,
  email_confirmed_at::text as confirmed,
  created_at::text
FROM auth.users
WHERE email = 'thami@snceventsmanagement.com'

UNION ALL

SELECT 
  'User Profile' as type,
  id::text,
  email,
  role as confirmed,
  name as created_at
FROM users
WHERE email = 'thami@snceventsmanagement.com';

-- IMPORTANT: The user's password is what you set/generated in Step 2
-- You'll need to get it from Supabase or reset it if you forget
