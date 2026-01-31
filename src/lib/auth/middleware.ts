
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { canAccessRoute, getRolePermissions, isValidRole, type UserRole } from "./rbac";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Verify user authentication and get their profile
 */
export async function verifyAuth(): Promise<User | null> {
  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from("users")
    .select("id,email,role")
    .eq("id", auth.user.id)
    .single();

  const profileRole = isValidRole(profile?.role) ? (profile.role as UserRole) : null;

  if (!error && profile && profileRole) {
    return {
      id: profile.id,
      email: profile.email,
      role: profileRole,
    };
  }

  const metadataRole =
    auth.user.user_metadata?.role ?? auth.user.app_metadata?.role ?? null;
  const fallbackRole = isValidRole(metadataRole)
    ? (metadataRole as UserRole)
    : process.env.NODE_ENV === "development"
    ? "PARENT"
    : null;

  if (!fallbackRole) {
    return null;
  }

  const email = auth.user.email ?? profile?.email ?? "";

  try {
    await supabase
      .from("users")
      .upsert(
        {
          id: auth.user.id,
          email,
          role: fallbackRole,
        },
        { onConflict: "id" }
      );
  } catch {
    // Ignore upsert errors (RLS may block in some environments)
  }

  return {
    id: auth.user.id,
    email,
    role: fallbackRole,
  };
}

/**
 * Protect a page route - verify authentication and role
 * Redirects unauthorized users to their appropriate dashboard
 */
export async function protectRoute(
  requiredRoles?: UserRole[]
): Promise<User> {
  const user = await verifyAuth();

  if (!user) {
    redirect("/auth/login");
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    const permissions = getRolePermissions(user.role);
    redirect(permissions.dashboardPath);
  }

  return user;
}

/**
 * Protect API routes - verify authentication and role
 */
export async function protectApiRoute(
  requiredRoles?: UserRole[]
): Promise<User> {
  const user = await verifyAuth();

  if (!user) {
    throw new Error("Unauthorized: User not authenticated");
  }

  if (requiredRoles && !requiredRoles.includes(user.role)) {
    throw new Error(
      `Forbidden: User role '${user.role}' does not have access to this resource`
    );
  }

  return user;
}

/**
 * Route-based access control
 * Redirects to appropriate dashboard if user cannot access the requested route
 */
export async function enforceRouteAccess(route: string): Promise<User> {
  const user = await verifyAuth();

  if (!user) {
    redirect("/auth/login");
  }

  if (!canAccessRoute(user.role, route)) {
    const permissions = getRolePermissions(user.role);
    redirect(permissions.dashboardPath);
  }

  return user;
}
