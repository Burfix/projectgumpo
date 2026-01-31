# Project Gumpo - RBAC Implementation Guide

## Summary

A comprehensive Role-Based Access Control (RBAC) system has been implemented for Project Gumpo with four distinct roles:

### 1. **SUPER_ADMIN** - System Administrator
- **Access Level**: Full system access
- **Key Responsibilities**:
  - Manage all users (create, modify, delete)
  - Assign and modify user roles
  - Access system logs and audit trails
  - Configure system-wide settings
  - Override any permissions
- **Dashboard**: `/dashboard/super-admin`

### 2. **ADMIN** - School Administrator/Principal
- **Access Level**: Institution-level management
- **Key Responsibilities**:
  - Link parents to their children
  - Link teachers to classes
  - Manage institutional users
  - View institutional reports and analytics
  - Monitor communications
- **Dashboard**: `/dashboard/admin`

### 3. **TEACHER** - Educator
- **Access Level**: Class and student management
- **Key Responsibilities**:
  - Manage assigned classes and students
  - Record attendance and daily logs
  - Update grades and assessments
  - Communicate with parents
  - Upload classroom materials
- **Dashboard**: `/dashboard/teacher`

### 4. **PARENT** - Guardian/Parent
- **Access Level**: Child's academic information only
- **Key Responsibilities**:
  - View child's academic progress
  - Check attendance records
  - View grades and assessments
  - Read daily reports
  - Communicate with teachers
- **Dashboard**: `/dashboard/parent`

---

## Files Added/Modified

### New Files Created:
1. **[ROLES_AND_PERMISSIONS.md](ROLES_AND_PERMISSIONS.md)**
   - Comprehensive documentation of all roles
   - Detailed responsibilities and permissions
   - Permission matrix
   - Access control rules
   - Implementation guidelines

2. **[src/lib/auth/rbac.ts](src/lib/auth/rbac.ts)**
   - Core RBAC utility functions
   - Role-to-permissions mapping
   - Permission checking functions
   - Route access control
   - Role hierarchy validation

3. **[src/lib/auth/middleware.ts](src/lib/auth/middleware.ts)**
   - Authentication verification
   - Route protection functions
   - API route protection
   - Role-based access enforcement

### Modified Files:
1. **[src/lib/auth.ts](src/lib/auth.ts)**
   - Added exports for RBAC utilities
   - Made role and permission functions easily accessible

2. **[src/app/dashboard/admin/page.tsx](src/app/dashboard/admin/page.tsx)**
   - Added role protection
   - Added admin-specific UI and responsibilities

3. **[src/app/dashboard/teacher/page.tsx](src/app/dashboard/teacher/page.tsx)**
   - Added role protection
   - Added teacher-specific UI and responsibilities

4. **[src/app/dashboard/parent/page.tsx](src/app/dashboard/parent/page.tsx)**
   - Added role protection
   - Added parent-specific UI and permissions

---

## Usage Examples

### Protecting a Page Route
```typescript
import { protectRoute } from "@/lib/auth/middleware";

export default async function AdminPage() {
  // Only ADMIN and SUPER_ADMIN can access
  const user = await protectRoute(["ADMIN", "SUPER_ADMIN"]);
  
  return <div>Welcome, {user.email}</div>;
}
```

### Checking Permissions
```typescript
import { hasPermission, getRolePermissions } from "@/lib/auth";

const permissions = getRolePermissions("ADMIN");
if (hasPermission("ADMIN", "canManageUsers")) {
  // Show user management UI
}
```

### Route Access Control
```typescript
import { canAccessRoute } from "@/lib/auth";

if (canAccessRoute("TEACHER", "/dashboard/admin")) {
  // Redirect to teacher dashboard
}
```

### Role Hierarchy
```typescript
import { isRoleHigherThan } from "@/lib/auth";

if (isRoleHigherThan("ADMIN", "TEACHER")) {
  // ADMIN is higher in hierarchy than TEACHER
}
```

---

## Permission Matrix

| Feature | SUPER_ADMIN | ADMIN | TEACHER | PARENT |
|---------|:---:|:---:|:---:|:---:|
| Manage All Users | ✅ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ❌ | ❌ | ❌ |
| Create Accounts | ✅ | ✅ | ❌ | ❌ |
| Link Parents ↔ Children | ✅ | ✅ | ❌ | ❌ |
| Link Teachers ↔ Classes | ✅ | ✅ | ❌ | ❌ |
| Manage Classes | ✅ | ✅ | ✅ | ❌ |
| Modify Grades | ✅ | ❌ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ⚠️ | ⚠️ |

---

## Security Features

1. **Server-Side Validation**: All permissions checked on the server before data access
2. **Route Protection**: Unauthorized users automatically redirected to appropriate dashboards
3. **Role Hierarchy**: Clear hierarchy prevents privilege escalation
4. **Data Isolation**: Users can only access relevant data for their role
5. **Audit Ready**: Structure supports comprehensive audit logging

---

## Testing Checklist

- [x] Super Admin dashboard loads correctly
- [x] Admin dashboard loads with role protection
- [x] Teacher dashboard loads with role protection
- [x] Parent dashboard loads with role protection
- [x] Build completes without errors
- [x] TypeScript compilation successful
- [x] Route protection working correctly
- [x] Permission checking functions implemented

---

## Next Steps / Future Enhancements

1. **Database RLS Policies**: Implement Supabase Row-Level Security for additional data protection
2. **Audit Logging**: Add detailed logging for all role changes and administrative actions
3. **Permission UI**: Create admin interface for viewing and managing permissions
4. **Granular Permissions**: Move from role-based to permission-based access control
5. **Custom Roles**: Allow institutions to create custom roles with specific permissions
6. **Time-Limited Elevations**: Support temporary role elevations for specific tasks
7. **API Routes**: Add protected API endpoints with role-based access
8. **Session Management**: Implement role-aware session handling and timeouts

---

## How It Works

```
User Login
    ↓
verifyAuth() - Get user and their role
    ↓
protectRoute(requiredRoles) - Check if user role is authorized
    ↓
✅ Access Granted / ❌ Redirect to appropriate dashboard
```

The RBAC system uses a hierarchical approach where each role has explicit permissions defined in [src/lib/auth/rbac.ts](src/lib/auth/rbac.ts). When a user tries to access a protected route, the middleware validates their role and either grants access or redirects them.

---

## Configuration

Role permissions are defined in `ROLE_PERMISSIONS` object in [src/lib/auth/rbac.ts](src/lib/auth/rbac.ts). To modify permissions:

1. Open `src/lib/auth/rbac.ts`
2. Find the role in `ROLE_PERMISSIONS`
3. Update the boolean flags
4. Run tests to ensure no regressions
