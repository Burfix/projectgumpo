-- Link ANY existing SUPER_ADMIN to Emma for parent dashboard testing
-- This will link the first SUPER_ADMIN it finds to Emma

INSERT INTO parent_child (parent_id, child_id, relationship)
SELECT 
  u.id,
  c.id,
  'parent'
FROM users u
CROSS JOIN children c
WHERE u.role = 'SUPER_ADMIN'
  AND c.first_name = 'Emma'
  AND c.last_name = 'Johnson'
LIMIT 1
ON CONFLICT (parent_id, child_id) DO NOTHING;

-- Verify the link and show which super admin was linked
SELECT 
  u.email as parent_email,
  u.name as parent_name,
  u.role,
  c.first_name || ' ' || c.last_name as child_name,
  pc.relationship
FROM parent_child pc
JOIN users u ON pc.parent_id = u.id
JOIN children c ON pc.child_id = c.id
WHERE u.role = 'SUPER_ADMIN'
  AND c.first_name = 'Emma';
