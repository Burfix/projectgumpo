import { createClient } from "@/lib/supabase/server";

// Re-export RBAC utilities for easy access
export {
  type UserRole,
  type RolePermissions,
  getRolePermissions,
  hasPermission,
  canAccessRoute,
  getDashboardPath,
  isRoleHigherThan,
  canManageRole,
  getRoleDescription,
  getAllRoles,
  isValidRole,
} from "./auth/rbac";

// Re-export middleware utilities
export {
  type User,
  verifyAuth,
  protectRoute,
  protectApiRoute,
  enforceRouteAccess,
} from "./auth/middleware";

export async function getCurrentProfile() {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;

  if (!user) return { user: null, profile: null };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,email,role")
    .eq("id", user.id)
    .single();

  if (error) return { user, profile: null };

  return { user, profile };
}
