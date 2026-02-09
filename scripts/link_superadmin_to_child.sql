-- Quick fix: Link super admin to test child for easier testing
DO $$
DECLARE
  super_admin_id uuid;
  child_id integer;
BEGIN
  -- Get super admin user
  SELECT id INTO super_admin_id FROM users WHERE email = 'superadmin@test.com';
  
  -- Get Emma (or create if needed)
  SELECT id INTO child_id FROM children WHERE first_name = 'Emma' LIMIT 1;
  
  IF super_admin_id IS NOT NULL AND child_id IS NOT NULL THEN
    -- Link super admin to child for testing
    INSERT INTO parent_child (parent_id, child_id, relationship)
    VALUES (super_admin_id, child_id, 'parent')
    ON CONFLICT (parent_id, child_id) DO NOTHING;
    
    RAISE NOTICE 'Linked superadmin@test.com to Emma for testing';
    RAISE NOTICE 'You can now login as superadmin@test.com and access parent dashboard';
  ELSE
    RAISE NOTICE 'Super admin ID: %, Child ID: %', super_admin_id, child_id;
  END IF;
END $$;
