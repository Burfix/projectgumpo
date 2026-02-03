-- Add PRINCIPAL role to user_role enum
DO $$
BEGIN
  -- Add PRINCIPAL if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PRINCIPAL') THEN
    ALTER TYPE user_role ADD VALUE 'PRINCIPAL';
  END IF;
  
  -- Add SUPER_ADMIN if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SUPER_ADMIN') THEN
    ALTER TYPE user_role ADD VALUE 'SUPER_ADMIN';
  END IF;
END$$;

-- Create super_admin_audit table for tracking actions
CREATE TABLE IF NOT EXISTS public.super_admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  action_type text NOT NULL, -- e.g., 'CREATE_USER', 'DELETE_LINK', 'ASSIGN_TEACHER', 'ALLOCATE_PRINCIPAL'
  entity_type text NOT NULL, -- e.g., 'user', 'parent_child', 'teacher_classroom', 'principal'
  entity_id text, -- ID of affected record
  changes jsonb, -- Before/after values
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for audit table
CREATE INDEX IF NOT EXISTS super_admin_audit_actor_idx ON public.super_admin_audit(actor_user_id);
CREATE INDEX IF NOT EXISTS super_admin_audit_school_idx ON public.super_admin_audit(school_id);
CREATE INDEX IF NOT EXISTS super_admin_audit_created_idx ON public.super_admin_audit(created_at);
CREATE INDEX IF NOT EXISTS super_admin_audit_action_idx ON public.super_admin_audit(action_type);

-- Enable RLS on audit table
ALTER TABLE public.super_admin_audit ENABLE ROW LEVEL SECURITY;

-- Policy: Only SUPER_ADMIN can view audit logs
CREATE POLICY "super_admin_can_view_audit" ON public.super_admin_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'SUPER_ADMIN'
    )
  );

-- Policy: Service role can insert (for server actions)
CREATE POLICY "audit_insert_policy" ON public.super_admin_audit
  FOR INSERT WITH CHECK (true);
