-- Migration: Schools with Statistics RPC Function
-- Creates an efficient function to fetch schools with aggregated user/child counts

-- Create the RPC function
CREATE OR REPLACE FUNCTION get_schools_with_stats()
RETURNS TABLE (
  id UUID,
  name TEXT,
  location TEXT,
  status TEXT,
  subscription_tier TEXT,
  children_count BIGINT,
  parents_count BIGINT,
  teachers_count BIGINT,
  admins_count BIGINT,
  created_at TIMESTAMPTZ
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    s.id,
    s.name,
    s.location,
    s.account_status as status,
    s.subscription_tier,
    COALESCE(COUNT(DISTINCT c.id), 0) as children_count,
    COALESCE(COUNT(DISTINCT CASE WHEN u.role = 'PARENT' THEN u.id END), 0) as parents_count,
    COALESCE(COUNT(DISTINCT CASE WHEN u.role = 'TEACHER' THEN u.id END), 0) as teachers_count,
    COALESCE(COUNT(DISTINCT CASE WHEN u.role = 'ADMIN' THEN u.id END), 0) as admins_count,
    s.created_at
  FROM schools s
  LEFT JOIN children c ON c.school_id = s.id
  LEFT JOIN users u ON u.school_id = s.id
  GROUP BY s.id, s.name, s.location, s.account_status, s.subscription_tier, s.created_at
  ORDER BY s.created_at DESC;
$$;

-- Grant execute permission to authenticated users (RLS will handle access control)
GRANT EXECUTE ON FUNCTION get_schools_with_stats() TO authenticated;

-- RLS Policies for schools table (if not already exists)
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins can view all schools" ON schools;
DROP POLICY IF EXISTS "Super admins can insert schools" ON schools;
DROP POLICY IF EXISTS "Super admins can update schools" ON schools;
DROP POLICY IF EXISTS "Admins can view their own school" ON schools;

-- Super admins can view all schools
CREATE POLICY "Super admins can view all schools" ON schools
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPER_ADMIN'
    )
  );

-- Super admins can insert schools
CREATE POLICY "Super admins can insert schools" ON schools
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPER_ADMIN'
    )
  );

-- Super admins can update schools
CREATE POLICY "Super admins can update schools" ON schools
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPER_ADMIN'
    )
  );

-- Admins can view their own school
CREATE POLICY "Admins can view their own school" ON schools
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.school_id = schools.id
      AND users.role = 'ADMIN'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_school_id_role ON users(school_id, role);
CREATE INDEX IF NOT EXISTS idx_children_school_id ON children(school_id);

COMMENT ON FUNCTION get_schools_with_stats() IS 'Returns all schools with aggregated counts of children, parents, teachers, and admins';
