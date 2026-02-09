-- Complete Invite System Fix
-- This creates a robust invite system that works from both Supabase UI and the app

-- ============================================================
-- PART 1: FIX THE TRIGGER (for Supabase UI invites)
-- ============================================================

-- Drop existing problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing problematic function
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Create a ROBUST handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_role TEXT;
  user_school_id UUID;
  invite_record RECORD;
BEGIN
  -- Check if there's a pending invite for this email
  SELECT * INTO invite_record
  FROM invites
  WHERE email = NEW.email
  ORDER BY created_at DESC
  LIMIT 1;

  -- Extract name
  BEGIN
    user_name := COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      invite_record.name,
      SPLIT_PART(NEW.email, '@', 1)
    );
  EXCEPTION WHEN OTHERS THEN
    user_name := COALESCE(invite_record.name, SPLIT_PART(NEW.email, '@', 1));
  END;

  -- Extract role
  BEGIN
    user_role := COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'role', ''),
      invite_record.role,
      'PARENT'
    );
  EXCEPTION WHEN OTHERS THEN
    user_role := COALESCE(invite_record.role, 'PARENT');
  END;

  -- Extract school_id
  user_school_id := COALESCE(
    (NEW.raw_user_meta_data->>'school_id')::UUID,
    invite_record.school_id
  );

  -- Create user profile
  INSERT INTO public.users (id, email, name, role, school_id, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role,
    user_school_id,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    role = COALESCE(EXCLUDED.role, users.role),
    school_id = COALESCE(EXCLUDED.school_id, users.school_id),
    updated_at = NOW();

  -- Mark invite as accepted
  IF invite_record.id IS NOT NULL THEN
    UPDATE invites
    SET 
      user_id = NEW.id,
      accepted_at = NOW(),
      updated_at = NOW()
    WHERE id = invite_record.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error in handle_new_user for email %: %', NEW.email, SQLERRM;
    
    -- Still try to create basic profile as fallback
    INSERT INTO public.users (id, email, name, role, created_at)
    VALUES (
      NEW.id,
      NEW.email,
      SPLIT_PART(NEW.email, '@', 1),
      'PARENT',
      NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PART 2: UPDATE INVITES TABLE SCHEMA
-- ============================================================

-- Add missing columns to invites table if they don't exist
DO $$
BEGIN
  -- Add name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'name'
  ) THEN
    ALTER TABLE invites ADD COLUMN name TEXT;
  END IF;

  -- Add school_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE invites ADD COLUMN school_id UUID REFERENCES schools(id) ON DELETE CASCADE;
  END IF;

  -- Add invited_by column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'invited_by'
  ) THEN
    ALTER TABLE invites ADD COLUMN invited_by UUID REFERENCES users(id) ON DELETE SET NULL;
  END IF;

  -- Add token column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'token'
  ) THEN
    ALTER TABLE invites ADD COLUMN token TEXT UNIQUE;
  END IF;

  -- Add expires_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'expires_at'
  ) THEN
    ALTER TABLE invites ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add accepted_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'accepted_at'
  ) THEN
    ALTER TABLE invites ADD COLUMN accepted_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invites' AND column_name = 'status'
  ) THEN
    ALTER TABLE invites ADD COLUMN status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS invites_email_idx ON invites(email);
CREATE INDEX IF NOT EXISTS invites_token_idx ON invites(token);
CREATE INDEX IF NOT EXISTS invites_school_id_idx ON invites(school_id);
CREATE INDEX IF NOT EXISTS invites_status_idx ON invites(status);

-- ============================================================
-- PART 3: UPDATE RLS POLICIES
-- ============================================================

-- Drop ALL existing policies on invites table
DROP POLICY IF EXISTS "Super admin can view all invites" ON invites;
DROP POLICY IF EXISTS "Service role can insert invites" ON invites;
DROP POLICY IF EXISTS "School admins can view school invites" ON invites;
DROP POLICY IF EXISTS "Super admins can view all invites" ON invites;
DROP POLICY IF EXISTS "School admins can create invites" ON invites;
DROP POLICY IF EXISTS "System can update invites" ON invites;

-- Allow principals/admins to view invites for their school
CREATE POLICY "School admins can view school invites" ON invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.school_id = invites.school_id
        AND users.role IN ('ADMIN', 'PRINCIPAL')
    )
  );

-- Allow super admins to view all invites
CREATE POLICY "Super admins can view all invites" ON invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'SUPER_ADMIN'
    )
  );

-- Allow principals/admins to create invites for their school
CREATE POLICY "School admins can create invites" ON invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.school_id = invites.school_id
        AND users.role IN ('ADMIN', 'PRINCIPAL', 'SUPER_ADMIN')
    )
  );

-- Allow updating invites (for marking as accepted)
CREATE POLICY "System can update invites" ON invites
  FOR UPDATE USING (true);

-- ============================================================
-- PART 4: VERIFICATION
-- ============================================================

-- Verify trigger exists
SELECT 
  'Trigger Status' as check_type,
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth'
  AND trigger_name = 'on_auth_user_created';

-- Verify invites table structure
SELECT 
  'Invites Table Structure' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'invites'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test query: Check if invites table is ready
SELECT 
  'Test Result' as check_type,
  COUNT(*) as total_invites,
  COUNT(*) FILTER (WHERE accepted_at IS NOT NULL) as accepted_invites,
  COUNT(*) FILTER (WHERE accepted_at IS NULL) as pending_invites
FROM invites;
