-- Migration: Create children table if not exists

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id BIGSERIAL PRIMARY KEY,
  school_id BIGINT REFERENCES schools(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- RLS Policies for children table
DROP POLICY IF EXISTS "Super admins can view all children" ON children;
DROP POLICY IF EXISTS "School admins can view their school children" ON children;
DROP POLICY IF EXISTS "Teachers can view their school children" ON children;
DROP POLICY IF EXISTS "Parents can view their own children" ON children;

-- Super admins can view all children
CREATE POLICY "Super admins can view all children" ON children
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPER_ADMIN'
    )
  );

-- School admins can view children in their school
CREATE POLICY "School admins can view their school children" ON children
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.school_id = children.school_id
      AND users.role = 'ADMIN'
    )
  );

-- Teachers can view children in their school
CREATE POLICY "Teachers can view their school children" ON children
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.school_id = children.school_id
      AND users.role = 'TEACHER'
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_children_school_id ON children(school_id);

COMMENT ON TABLE children IS 'Stores information about children enrolled in schools';
