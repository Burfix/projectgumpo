-- Create ENUM type for user roles if not exists
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
		CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT');
	END IF;
END$$;

-- Add school_id and role columns to users table if not exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'ADMIN';
-- Example: Create an ADMIN user for onboarding
-- Replace the email, name, and phone as needed
INSERT INTO public.users (id, school_id, role, name, email, phone)
VALUES (
	gen_random_uuid(),
	(SELECT id FROM public.schools LIMIT 1),
	'ADMIN',
	'Onboarding Admin',
	'onboarding-admin@example.com',
	'+1234567890'
)
ON CONFLICT DO NOTHING;
-- Create ENUM type for user roles if not exists
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
		CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT');
	END IF;
END$$;

-- Create public.users profile table if not exists
CREATE TABLE IF NOT EXISTS public.users (
	id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
	school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
	role user_role NOT NULL DEFAULT 'ADMIN',
	name text,
	email text,
	phone text,
	created_at timestamptz NOT NULL DEFAULT now()
);

-- Example: Create an ADMIN user for onboarding
-- Replace the email, name, and phone as needed
INSERT INTO public.users (id, school_id, role, name, email, phone)
VALUES (
	gen_random_uuid(),
	(SELECT id FROM public.schools LIMIT 1),
	'ADMIN',
	'Onboarding Admin',
	'onboarding-admin@example.com',
	'+1234567890'
)
ON CONFLICT DO NOTHING;

ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'Preschool';
