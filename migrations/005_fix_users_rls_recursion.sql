-- Fix infinite recursion in users table RLS policies
-- by using get_user_school_id() function instead of subquery

-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view users in their school" ON public.users;
DROP POLICY IF EXISTS "Admins can insert users in their school" ON public.users;
DROP POLICY IF EXISTS "Admins can update users in their school" ON public.users;

-- Create helper function to get user's school_id (breaks recursion)
CREATE OR REPLACE FUNCTION get_user_school_id(user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result uuid;
BEGIN
  SELECT school_id INTO result FROM public.users WHERE id = user_id LIMIT 1;
  RETURN result;
END;
$$;

-- Create helper function to get user's role (breaks recursion)
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result text;
BEGIN
  SELECT role INTO result FROM public.users WHERE id = user_id LIMIT 1;
  RETURN result;
END;
$$;

-- Recreate policies with fixed logic
CREATE POLICY "Users can view users in their school" ON public.users
  FOR SELECT USING (
    school_id = get_user_school_id(auth.uid())
    OR get_user_role(auth.uid()) = 'SUPER_ADMIN'
    OR id = auth.uid()  -- Users can always see themselves
  );

CREATE POLICY "Admins can insert users in their school" ON public.users
  FOR INSERT WITH CHECK (
    (school_id = get_user_school_id(auth.uid()) 
     AND get_user_role(auth.uid()) IN ('ADMIN', 'PRINCIPAL', 'SECONDARY_PRINCIPAL', 'SUPER_ADMIN'))
    OR get_user_role(auth.uid()) = 'SUPER_ADMIN'
  );

CREATE POLICY "Admins can update users in their school" ON public.users
  FOR UPDATE USING (
    (school_id = get_user_school_id(auth.uid()) 
     AND get_user_role(auth.uid()) IN ('ADMIN', 'PRINCIPAL', 'SECONDARY_PRINCIPAL', 'SUPER_ADMIN'))
    OR id = auth.uid()  -- Users can update themselves
    OR get_user_role(auth.uid()) = 'SUPER_ADMIN'
  );

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_school_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(uuid) TO authenticated;
