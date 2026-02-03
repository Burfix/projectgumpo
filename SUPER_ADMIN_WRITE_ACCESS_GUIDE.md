# Super Admin Write Access Implementation Guide

## Overview
This document outlines the implementation of **Super Admin write access while viewing a school** and **Principal role allocation** for the Project Gumpo platform.

## Phase A: Role Model & PRINCIPAL Role ✅

### Changes Made
1. **Migration: `005_add_principal_role_and_audit.sql`**
   - Added `PRINCIPAL` role to the `user_role` enum (Postgres)
   - Created `super_admin_audit` table for tracking all super-admin actions
   - Audit table captures: actor, school, action_type, entity_type, entity_id, changes, timestamp
   - RLS policies restrict audit log viewing to SUPER_ADMIN only

2. **RBAC Updates: `src/lib/auth/rbac.ts`**
   - Added `PRINCIPAL` to `UserRole` type
   - PRINCIPAL permissions:
     - `canManageUsers: true`
     - `canAccessSystemSettings: true`
     - Dashboard path: `/dashboard/admin`
   - Updated role hierarchy: `SUPER_ADMIN > ADMIN > PRINCIPAL > TEACHER > PARENT`
   - Updated route access to include PRINCIPAL in admin routes

### Role Definitions
| Role | Can Manage Users | Can Assign Roles | Can View All Data | Dashboard |
|------|------------------|------------------|-------------------|-----------|
| SUPER_ADMIN | ✅ | ✅ | ✅ | System Admin |
| ADMIN | ✅ | ❌ | ✅ | Admin |
| PRINCIPAL | ✅ | ❌ | ✅ | Admin (Principal view) |
| TEACHER | ❌ | ❌ | ❌ | Teacher |
| PARENT | ❌ | ❌ | ❌ | Parent |

---

## Phase B: School Context & Impersonation ✅

### Current Structure
1. **URL-based School Context**
   - Super Admin navigates to: `/dashboard/super-admin/impersonate/[schoolId]`
   - `schoolId` is passed via URL parameter to all nested routes
   - "Exit Impersonation" button returns to `/dashboard/super-admin/schools`

2. **Impersonation Banner**
   - Amber banner shows: "Viewing as Super Admin — [School Name]"
   - Exit button clearly visible for quick return to schools list

3. **Dashboard Actions**
   - All impersonate pages access: Link Parent to Child, Assign Teacher to Class, Manage Users, etc.
   - `schoolId` is passed to all client actions

---

## Phase C: Server Actions (Write Operations) ✅

### File: `src/lib/auth/super-admin-actions.ts`

All server actions:
- Require `SUPER_ADMIN` role (verified via `protectRoute()`)
- Validate target records belong to `activeSchoolId`
- Include automatic audit logging
- Return `{ success: boolean, data?: any, error?: string }`

#### 1. **linkParentToChild**
```typescript
Input: { parentId, childId, schoolId }
- Validates parent and child both belong to school
- Inserts into parent_child table
- Audits the action
```

#### 2. **unlinkParentToChild**
```typescript
Input: { parentId, childId, schoolId }
- Deletes parent-child link
- Audits deletion
```

#### 3. **assignTeacherToClass**
```typescript
Input: { teacherId, classroomId, schoolId }
- Validates teacher and classroom both belong to school
- Inserts into teacher_classroom table
- Audits assignment
```

#### 4. **unassignTeacherFromClass**
```typescript
Input: { teacherId, classroomId, schoolId }
- Deletes teacher-classroom assignment
- Audits deletion
```

#### 5. **allocatePrincipalToSchool** ⭐ NEW
```typescript
Input: { userId, schoolId }
- Validates user exists and belongs to school
- Updates user.role = 'PRINCIPAL'
- Audits promotion
- User can then access /dashboard/admin as PRINCIPAL
```

#### 6. **removePrincipalFromSchool** ⭐ NEW
```typescript
Input: { userId, schoolId, newRole? }
- Validates user is PRINCIPAL
- Updates user.role (default: 'ADMIN')
- Audits demotion
```

### API Endpoints

#### `GET /api/schools/[schoolId]/users`
- Returns all users for a school
- SUPER_ADMIN only (RLS enforced)
- Returns: `User[]` with id, name, email, phone, role, school_id, created_at

#### `GET /api/schools/[schoolId]`
- Returns school details
- Already existed, reused for impersonation pages

---

## Phase D: Frontend Implementation ✅

### File: `src/app/dashboard/super-admin/impersonate/[schoolId]/manage-users/ManageUsersClient.tsx`

**Features:**
- Displays all users in the school (table format)
- Role badges with color coding
- **Action Buttons:**
  - For ADMIN users: "Make Principal" button
  - For PRINCIPAL users: "Remove Principal" button
- Loading states during actions
- Success/error messages
- Automatic refresh after actions

**UI Components:**
- Loading skeleton
- Error alert box
- Success toast notification
- Role badge colors:
  - SUPER_ADMIN: Red
  - PRINCIPAL: Purple
  - ADMIN: Blue
  - TEACHER: Green
  - PARENT: Amber

---

## Security Architecture

### Non-Negotiable Principles ✅

1. **Server-Side Enforcement**
   - All write operations use `protectRoute(["SUPER_ADMIN"])` first
   - School scope validation on every query
   - Never trust client-provided claims

2. **RLS (Row Level Security)**
   - All tables with `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
   - Policies enforce:
     - SUPER_ADMIN can view all records
     - ADMIN/PRINCIPAL can only view their school's data
   - Audit table: only SUPER_ADMIN can view

3. **Service Role Usage**
   - Client-side: uses authenticated user's token
   - Server actions/routes: uses service role (via `createServerClient()`)
   - No password modifications (app-level changes only)

4. **Audit Trail**
   - Every write action logged to `super_admin_audit` table
   - Captures: actor, school, action, entity, changes, timestamp
   - Immutable record of who did what to which school

---

## Database Schema

### `super_admin_audit` Table
```sql
CREATE TABLE super_admin_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid NOT NULL REFERENCES auth.users(id),
  school_id uuid REFERENCES public.schools(id),
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  changes jsonb,
  created_at timestamptz DEFAULT now()
);
```

**Action Types:**
- `CREATE_LINK` - Linked parent to child
- `DELETE_LINK` - Unlinked parent from child
- `ASSIGN_TEACHER` - Assigned teacher to class
- `UNASSIGN_TEACHER` - Unassigned teacher from class
- `ALLOCATE_PRINCIPAL` - Promoted user to Principal
- `REMOVE_PRINCIPAL` - Demoted Principal

---

## Usage Flow

### Example: Allocate a Principal

1. **Super Admin navigates to:** `/dashboard/super-admin/impersonate/[schoolId]/manage-users`
2. **Views list of users** for that school
3. **Clicks "Make Principal"** next to an ADMIN user
4. **Frontend calls:** `allocatePrincipalToSchool({ userId, schoolId })`
5. **Server action:**
   - Verifies super admin is authenticated
   - Validates user belongs to school
   - Updates user.role = 'PRINCIPAL'
   - Logs audit entry
   - Returns success
6. **Frontend:**
   - Shows success message
   - Reloads user list
   - User now shows as PRINCIPAL with "Remove Principal" button

### Principal Access

After allocation, the Principal can:
- Log in with their email
- Access `/dashboard/admin` (via role-based routing)
- Perform school management tasks (with ADMIN permissions)
- Cannot access system settings (unlike SUPER_ADMIN)

---

## Testing Checklist

- [ ] SUPER_ADMIN can view schools
- [ ] SUPER_ADMIN can impersonate a school
- [ ] SUPER_ADMIN can navigate to Manage Users page
- [ ] User list loads for the school
- [ ] SUPER_ADMIN can "Make Principal" for an ADMIN user
- [ ] User role updates to PRINCIPAL in UI
- [ ] Audit log entry created
- [ ] SUPER_ADMIN can "Remove Principal" for a PRINCIPAL user
- [ ] User role reverts to ADMIN
- [ ] Audit log entry created for demotion
- [ ] "Exit Impersonation" returns to schools list
- [ ] Non-SUPER_ADMIN users cannot access impersonation pages
- [ ] All write actions are scoped to the active school

---

## Next Steps (Future)

1. **Link Parent to Child UI**
   - Create page for super admin to assign parents to children
   - Use `linkParentToChild()` server action

2. **Assign Teacher to Class UI**
   - Create page for teacher-classroom assignments
   - Use `assignTeacherToClass()` server action

3. **Audit Log Viewer**
   - Create admin page to view all super-admin actions
   - Filter by school, date, action type

4. **Invitation System**
   - Invite new users to a school
   - Set their initial role (ADMIN, TEACHER, PARENT, etc.)

---

## Migration Instructions

1. Run the migration: `005_add_principal_role_and_audit.sql`
   ```bash
   psql <DATABASE_URL> -f migrations/005_add_principal_role_and_audit.sql
   ```

2. Rebuild TypeScript to ensure all types are correct

3. Test in staging before production deployment

