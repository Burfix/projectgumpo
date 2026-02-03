# Quick Start: Super Admin Write Access

## 1. Run Database Migration

```bash
cd /Users/Thami/Desktop/projectgumpo
psql <your-supabase-url> -f migrations/005_add_principal_role_and_audit.sql
```

## 2. Test Super Admin Actions

### Link Parent to Child
Navigate to: `/dashboard/super-admin/impersonate/[schoolId]/link-parent-to-child`

1. Select a parent from dropdown
2. Select a child from dropdown
3. Choose relationship type
4. Click "Link Parent to Child"

### Allocate Principal
From the Super Admin schools page:

```typescript
// Use the AllocatePrincipalModal component
import AllocatePrincipalModal from '@/app/dashboard/super-admin/_components/AllocatePrincipalModal';

<AllocatePrincipalModal
  schoolId={school.id}
  schoolName={school.name}
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => {
    // Refresh school list
  }}
/>
```

## 3. Use Server Actions in Your Code

```typescript
import {
  linkParentToChild,
  assignTeacherToClass,
  allocatePrincipalToSchool,
  createUser,
} from '@/lib/actions';

// Link parent to child
const result = await linkParentToChild({
  parentId: "uuid",
  childId: 123,
  schoolId: 456,
  relationshipType: "Parent"
});

if (result.success) {
  console.log("Linked successfully");
} else {
  console.error(result.error);
}

// Create a new principal
const principal = await allocatePrincipalToSchool({
  schoolId: 456,
  email: "principal@school.com",
  name: "Jane Smith"
});
```

## 4. Check Audit Logs

Query the audit table:

```sql
SELECT 
  actor_user_id,
  action_type,
  entity_type,
  school_id,
  changes,
  created_at
FROM super_admin_audit
WHERE school_id = YOUR_SCHOOL_ID
ORDER BY created_at DESC;
```

## 5. Verify RLS Policies

Test as different roles:

```sql
-- As SUPER_ADMIN (can see all)
SELECT * FROM parent_child;

-- As ADMIN (can only see their school)
SELECT * FROM parent_child WHERE school_id = 1;

-- As PARENT (can only see their children)
SELECT * FROM parent_child WHERE parent_id = auth.uid();
```

## Common Tasks

### Add "Allocate Principal" Button to Schools List

```typescript
"use client";

import { useState } from 'react';
import AllocatePrincipalModal from './_components/AllocatePrincipalModal';

export default function SchoolsList() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);

  return (
    <>
      {schools.map(school => (
        <div key={school.id}>
          <button onClick={() => {
            setSelectedSchool(school);
            setShowModal(true);
          }}>
            Allocate Principal
          </button>
        </div>
      ))}

      {selectedSchool && (
        <AllocatePrincipalModal
          schoolId={selectedSchool.id}
          schoolName={selectedSchool.name}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
```

### Create API Endpoint for School Users

```typescript
// app/api/schools/[schoolId]/users/route.ts
import { NextResponse } from 'next/server';
import { getSchoolUsers } from '@/lib/actions';

export async function GET(
  request: Request,
  { params }: { params: { schoolId: string } }
) {
  const schoolId = parseInt(params.schoolId);
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');

  const result = await getSchoolUsers(schoolId);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  let users = result.data;

  // Filter by role if specified
  if (role) {
    users = users.filter(u => u.role === role);
  }

  return NextResponse.json(users);
}
```

### Update Other Impersonation Pages

Follow the same pattern as `link-parent-to-child`:

1. Create a client component for the form
2. Use server actions from `/src/lib/actions`
3. Load initial data server-side
4. Pass to client component
5. Handle loading/error/success states

## Troubleshooting

### "Unauthorized" Error
- Check user is logged in
- Verify user has correct role in database
- Check `users` table has correct `school_id`

### "Access denied to this school"
- ADMIN/PRINCIPAL users can only access their assigned school
- SUPER_ADMIN can access any school
- Verify `school_id` matches in database

### RLS Policy Violations
- Check Supabase logs
- Verify policies exist: `\dp parent_child` in psql
- Ensure user role is correctly set in auth.jwt()

### Missing Data
- Ensure migration 005 ran successfully
- Check tables exist: `\dt` in psql
- Verify indexes created: `\di` in psql

## Next Steps

1. ✅ Run migration
2. ✅ Test link parent-child
3. ✅ Test allocate principal
4. 🔄 Add API endpoints for children/users
5. 🔄 Update remaining impersonation pages
6. 🔄 Add email invitations
7. 🔄 Create principal dashboard
