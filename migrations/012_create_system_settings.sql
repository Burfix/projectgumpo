-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  maintenance_mode BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT,
  session_timeout_minutes INTEGER DEFAULT 60,
  password_min_length INTEGER DEFAULT 8,
  password_require_uppercase BOOLEAN DEFAULT TRUE,
  password_require_lowercase BOOLEAN DEFAULT TRUE,
  password_require_numbers BOOLEAN DEFAULT TRUE,
  password_require_special BOOLEAN DEFAULT FALSE,
  max_login_attempts INTEGER DEFAULT 5,
  login_lockout_minutes INTEGER DEFAULT 15,
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_from_email TEXT,
  feature_flags JSONB DEFAULT '{
    "messaging": true,
    "photos": true,
    "reports": true,
    "audit_logs": true
  }'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Only super admins can read and modify system settings
CREATE POLICY "Super admins can manage system settings"
  ON system_settings
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
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
