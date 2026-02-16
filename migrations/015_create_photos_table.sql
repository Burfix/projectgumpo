-- Create photos table to track uploaded photos
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
  classroom_id INTEGER REFERENCES classrooms(id) ON DELETE CASCADE,
  activity_id INTEGER REFERENCES daily_activities(id) ON DELETE CASCADE,
  incident_id INTEGER REFERENCES incident_reports(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  caption TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Teachers can view photos in their school
CREATE POLICY "Teachers can view school photos"
  ON photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.school_id = photos.school_id
      AND users.role IN ('TEACHER', 'ADMIN', 'PRINCIPAL', 'SUPER_ADMIN')
    )
  );

-- Parents can view photos of their children
CREATE POLICY "Parents can view their children's photos"
  ON photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parent_child
      WHERE parent_child.parent_id = auth.uid()
      AND parent_child.child_id = photos.child_id
    )
  );

-- Teachers can insert photos in their school
CREATE POLICY "Teachers can upload photos"
  ON photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.school_id = photos.school_id
      AND users.role IN ('TEACHER', 'ADMIN', 'PRINCIPAL')
    )
  );

-- Teachers can update their own photos
CREATE POLICY "Teachers can update own photos"
  ON photos
  FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Teachers can delete their own photos
CREATE POLICY "Teachers can delete own photos"
  ON photos
  FOR DELETE
  TO authenticated
  USING (uploaded_by = auth.uid());

-- Super admins can manage all photos
CREATE POLICY "Super admins can manage all photos"
  ON photos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPER_ADMIN'
    )
  );

-- Create indexes
CREATE INDEX idx_photos_school ON photos(school_id);
CREATE INDEX idx_photos_child ON photos(child_id);
CREATE INDEX idx_photos_classroom ON photos(classroom_id);
CREATE INDEX idx_photos_activity ON photos(activity_id);
CREATE INDEX idx_photos_incident ON photos(incident_id);
CREATE INDEX idx_photos_created_at ON photos(created_at DESC);

-- Create updated_at trigger
CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
