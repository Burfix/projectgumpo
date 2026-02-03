
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "PRINCIPAL" | "TEACHER" | "PARENT";

export interface RolePermissions {
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
  canAllocatePrincipals: boolean;
  dashboardPath: string;
}

// Role permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  SUPER_ADMIN: {
    role: "SUPER_ADMIN",
    canManageUsers: true,
    canAssignRoles: true,
    canViewAllData: true,
    canCreateAccounts: true,
    canLinkParentsToChildren: true,
    canLinkTeachersToClasses: true,
    canManageClasses: true,
    canModifyGrades: false,
    canAccessSystemSettings: true,
    canAllocatePrincipals: true,
    dashboardPath: "/dashboard/super-admin",
  },
  ADMIN: {
    role: "ADMIN",
    canManageUsers: true,
    canAssignRoles: false,
    canViewAllData: true,
    canCreateAccounts: true,
    canLinkParentsToChildren: true,
    canLinkTeachersToClasses: true,
    canManageClasses: true,
    canModifyGrades: false,
    canAccessSystemSettings: false,
    canAllocatePrincipals: false,
    dashboardPath: "/dashboard/admin",
  },
  PRINCIPAL: {
    role: "PRINCIPAL",
    canManageUsers: true,
    canAssignRoles: false,
    canViewAllData: true,
    canCreateAccounts: true,
    canLinkParentsToChildren: true,
    canLinkTeachersToClasses: true,
    canManageClasses: true,
    canModifyGrades: false,
    canAccessSystemSettings: true,
    canAllocatePrincipals: false,
    dashboardPath: "/dashboard/admin",
  },
  TEACHER: {
    role: "TEACHER",
    canManageUsers: false,
    canAssignRoles: false,
    canViewAllData: false,
    canCreateAccounts: false,
    canLinkParentsToChildren: false,
    canLinkTeachersToClasses: false,
    canManageClasses: true,
    canModifyGrades: true,
    canAccessSystemSettings: false,
    canAllocatePrincipals: false,
    dashboardPath: "/dashboard/teacher",
  },
  PARENT: {
    role: "PARENT",
    canManageUsers: false,
    canAssignRoles: false,
    canViewAllData: false,
    canCreateAccounts: false,
    canLinkParentsToChildren: false,
    canLinkTeachersToClasses: false,
    canManageClasses: false,
    canModifyGrades: false,
    canAccessSystemSettings: false,
    canAllocatePrincipals: false,
    dashboardPath: "/dashboard/parent",
  },
};

/**
 * Get permissions for a specific role
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: UserRole,
  permission: keyof RolePermissions
): boolean {
  const permissions = getRolePermissions(role);
  if (permission === "role" || permission === "dashboardPath") {
    return false; // These are not permissions
  }
  return permissions[permission as keyof Omit<RolePermissions, "role" | "dashboardPath">];
}

/**
 * Check if a role can access a route
 */
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const routeAccessMap: Record<string, UserRole[]> = {
    "/dashboard/super-admin": ["SUPER_ADMIN"],
    "/dashboard/admin": ["SUPER_ADMIN", "ADMIN", "PRINCIPAL"],
    "/dashboard/teacher": ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "TEACHER"],
    "/dashboard/parent": ["SUPER_ADMIN", "ADMIN", "TEACHER", "PARENT"],
  };

  const allowedRoles = routeAccessMap[route];
  if (!allowedRoles) {
    return true; // Route is public
  }

  return allowedRoles.includes(userRole);
}

/**
 * Get the appropriate dashboard path for a user role
 */
export function getDashboardPath(role: UserRole): string {
  return getRolePermissions(role).dashboardPath;
}

/**
 * Check if a role is higher in the hierarchy than another
 */
export function isRoleHigherThan(
  currentRole: UserRole,
  comparedToRole: UserRole
): boolean {
  const hierarchy: UserRole[] = ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "TEACHER", "PARENT"];
  const currentIndex = hierarchy.indexOf(currentRole);
  const comparedIndex = hierarchy.indexOf(comparedToRole);

  return currentIndex < comparedIndex;
}

/**
 * Check if a role can manage another role
 * A role can manage roles lower in the hierarchy, but cannot manage itself or higher roles
 */
export function canManageRole(userRole: UserRole, targetRole: UserRole): boolean {
  // Only SUPER_ADMIN can assign roles
  if (userRole !== "SUPER_ADMIN") {
    return false;
  }

  // SUPER_ADMIN cannot change their own role
  if (userRole === targetRole) {
    return false;
  }

  return true;
}

/**
 * Get description of a role
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    SUPER_ADMIN: "System Administrator - Full system access and user management",
    ADMIN: "School Administrator - Institution-level management",
    PRINCIPAL: "School Principal - Full school management and operations",
    TEACHER: "Educator - Classroom management and student tracking",
    PARENT: "Guardian/Parent - Access to child's academic progress",
  };

  return descriptions[role];
}

/**
 * Get all available roles
 */
export function getAllRoles(): UserRole[] {
  return ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "TEACHER", "PARENT"];
}

/**
 * Validate if a string is a valid role
 */
export function isValidRole(role: unknown): role is UserRole {
  return typeof role === "string" && ["SUPER_ADMIN", "ADMIN", "PRINCIPAL", "TEACHER", "PARENT"].includes(role);
}
