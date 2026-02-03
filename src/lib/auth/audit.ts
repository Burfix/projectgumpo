/**
 * Audit logging utilities for tracking Super Admin and Admin actions
 * All write operations should be audited for compliance and security
 */

import { createClient } from "@/lib/supabase/server";
import { UserRole } from "./rbac";

export interface AuditLogEntry {
  actorUserId: string;
  actorRole: UserRole;
  actionType: string;
  entityType: string;
  entityId?: string;
  schoolId?: number | string;
  changes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Log an administrative action to the audit table
 * This uses the service role client to bypass RLS
 */
export async function logAuditAction(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase.from("super_admin_audit").insert({
      actor_user_id: entry.actorUserId,
      action_type: entry.actionType,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      school_id: entry.schoolId ? String(entry.schoolId) : null,
      changes: entry.changes || {},
    });

    if (error) {
      console.error("Failed to log audit action:", error);
      // Don't throw - we don't want to fail the operation if audit logging fails
    }
  } catch (error) {
    console.error("Audit logging error:", error);
  }
}

/**
 * Validate that a user has permission to perform an action on a school
 * This must be called at the start of every server action that modifies school data
 */
export async function validateSchoolAccess(
  userId: string,
  schoolId: number | string,
  requiredRoles: UserRole[] = ["SUPER_ADMIN", "ADMIN", "PRINCIPAL"]
): Promise<{ valid: boolean; userRole?: UserRole; error?: string }> {
  try {
    const supabase = await createClient();

    // Get user's role and school association
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("role, school_id")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return { valid: false, error: "User not found or unauthorized" };
    }

    const userRole = user.role as UserRole;

    // Check if user has required role
    if (!requiredRoles.includes(userRole)) {
      return { valid: false, error: "Insufficient permissions" };
    }

    // SUPER_ADMIN can access any school
    if (userRole === "SUPER_ADMIN") {
      return { valid: true, userRole };
    }

    // ADMIN and PRINCIPAL must be associated with the target school
    if (user.school_id !== schoolId && user.school_id !== Number(schoolId)) {
      return { valid: false, error: "Access denied to this school" };
    }

    return { valid: true, userRole };
  } catch (error) {
    console.error("School access validation error:", error);
    return { valid: false, error: "Validation failed" };
  }
}

/**
 * Get the current authenticated user with their role
 */
export async function getCurrentUser(): Promise<{
  id: string;
  role: UserRole;
  schoolId?: number;
} | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role, school_id")
      .eq("id", authUser.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      id: authUser.id,
      role: profile.role as UserRole,
      schoolId: profile.school_id,
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}
