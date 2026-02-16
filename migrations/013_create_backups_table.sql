-- Create backups table
CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('full', 'incremental')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  size_mb NUMERIC(10, 2),
  records_count INTEGER,
  tables_included TEXT[],
  metadata JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Only super admins can manage backups
CREATE POLICY "Super admins can manage backups"
  ON backups
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPER_ADMIN'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_backups_updated_at
  BEFORE UPDATE ON backups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_backups_created_at ON backups(created_at DESC);
CREATE INDEX idx_backups_status ON backups(status);
