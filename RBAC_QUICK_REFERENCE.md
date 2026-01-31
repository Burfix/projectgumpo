# RBAC Quick Reference

## Import Statements

```typescript
// From main auth module
import { 
  type UserRole,
  getRolePermissions,
  hasPermission,
  canAccessRoute,
  getDashboardPath,
  isRoleHigherThan,
  canManageRole,
  protectRoute,
  protectApiRoute,
  verifyAuth,
  enforceRouteAccess
} from "@/lib/auth";
```

## Quick Functions

### Protect a Page
```typescript
const user = await protectRoute(["ADMIN", "SUPER_ADMIN"]);
```

### Verify Authentication Only
```typescript
const user = await verifyAuth();
if (!user) redirect("/auth/login");
```

### Check Single Permission
```typescript
if (hasPermission("ADMIN", "canManageUsers")) {
  // Allow operation
}
```

### Get All Permissions for Role
```typescript
const perms = getRolePermissions("TEACHER");
console.log(perms.canModifyGrades); // true
```

### Check Route Access
```typescript
if (canAccessRoute("PARENT", "/dashboard/admin")) {
  // Parent can access admin dashboard (they can't)
}
```

### Get Dashboard for Role
```typescript
const path = getDashboardPath("TEACHER"); // "/dashboard/teacher"
redirect(path);
```

### Check Role Hierarchy
```typescript
if (isRoleHigherThan("ADMIN", "TEACHER")) {
  // Admin is higher than teacher
}
```

## Role Constants

```typescript
type UserRole = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "PARENT"

// Get all roles
import { getAllRoles } from "@/lib/auth";
const roles = getAllRoles(); // ["SUPER_ADMIN", "ADMIN", "TEACHER", "PARENT"]

// Validate role string
import { isValidRole } from "@/lib/auth";
if (isValidRole(someString)) {
  // It's a valid role
}
```

## Route Protection Patterns

### Admin Only
```typescript
const user = await protectRoute(["ADMIN"]);
```

### Admin or Higher
```typescript
const user = await protectRoute(["SUPER_ADMIN", "ADMIN"]);
```

### Teacher or Higher
```typescript
const user = await protectRoute(["SUPER_ADMIN", "ADMIN", "TEACHER"]);
```

### Any Authenticated User
```typescript
const user = await verifyAuth();
if (!user) redirect("/auth/login");
```

## Role Descriptions

```typescript
import { getRoleDescription } from "@/lib/auth";

getRoleDescription("SUPER_ADMIN")
// "System Administrator - Full system access and user management"

getRoleDescription("ADMIN")
// "School Administrator/Principal - Institution-level management"

getRoleDescription("TEACHER")
// "Educator - Classroom management and student tracking"

getRoleDescription("PARENT")
// "Guardian/Parent - Access to child's academic progress"
```

## Common Patterns

### Redirect to Appropriate Dashboard
```typescript
const user = await verifyAuth();
if (!user) redirect("/auth/login");

const { dashboardPath } = getRolePermissions(user.role);
redirect(dashboardPath);
```

### Show/Hide UI Based on Role
```typescript
import { hasPermission } from "@/lib/auth";

export function ManageUsersButton({ userRole }: { userRole: UserRole }) {
  if (!hasPermission(userRole, "canManageUsers")) {
    return null;
  }
  return <button>Manage Users</button>;
}
```

### Validate Admin Action
```typescript
import { canManageRole } from "@/lib/auth";

async function assignRole(currentUser: UserRole, targetRole: UserRole) {
  if (!canManageRole(currentUser, targetRole)) {
    throw new Error("Cannot assign this role");
  }
  // Proceed with role assignment
}
```

## Type Definitions

```typescript
interface User {
  id: string;
  email: string;
  role: UserRole;
}

interface RolePermissions {
  role: UserRole;
  canManageUsers: boolean;
  canAssignRoles: boolean;
  canViewAllData: boolean;
  canCreateAccounts: boolean;
  canLinkParentsToChildren: boolean;
  canLinkTeachersToClasses: boolean;
  canManageClasses: boolean;
  canModifyGrades: boolean;
  canAccessSystemSettings: boolean;
  dashboardPath: string;
}
```

## Error Handling

```typescript
try {
  const user = await protectRoute(["ADMIN"]);
} catch (error) {
  // User is redirected, but if using protectApiRoute:
  console.error(error.message);
  // "Unauthorized: User not authenticated"
  // or
  // "Forbidden: User role 'TEACHER' does not have access to this resource"
}
```

## Database Queries with Role Check

```typescript
import { verifyAuth, hasPermission } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function getUsers() {
  const user = await verifyAuth();
  
  if (!user) throw new Error("Not authenticated");
  if (!hasPermission(user.role, "canViewAllData")) {
    throw new Error("Not authorized to view all users");
  }

  const supabase = await createClient();
  return supabase.from("users").select("*");
}
```

---

**For detailed documentation, see:** [ROLES_AND_PERMISSIONS.md](ROLES_AND_PERMISSIONS.md)
**For implementation details, see:** [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
