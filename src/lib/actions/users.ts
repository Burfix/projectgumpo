"use server";

/**
 * Server actions for managing users and allocating principals
 * These actions enforce proper authorization and audit logging
 */

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser, logAuditAction, validateSchoolAccess } from "@/lib/auth/audit";
import { UserRole } from "@/lib/auth/rbac";
import { revalidatePath } from "next/cache";
import { ServerActionResult } from "./parent-child";

export interface CreateUserInput {
  email: string;
  name: string;
  role: UserRole;
  schoolId: number;
  phone?: string;
  sendInvite?: boolean;
}

export interface UpdateUserInput {
  userId: string;
  schoolId: number;
  name?: string;
  phone?: string;
  role?: UserRole;
}

export interface AllocatePrincipalInput {
  principalId?: string; // Existing user ID
  schoolId: number;
  // For creating new principal
  email?: string;
  name?: string;
  phone?: string;
}

/**
 * Create a new user in a school
 * Can be called by SUPER_ADMIN (for any school) or ADMIN/PRINCIPAL (for their school)
 */
export async function createUser(
  input: CreateUserInput
): Promise<ServerActionResult<{ userId: string }>> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const accessCheck = await validateSchoolAccess(
      currentUser.id,
      input.schoolId,
      ["SUPER_ADMIN", "ADMIN", "PRINCIPAL"]
    );

    if (!accessCheck.valid) {
      return { success: false, error: accessCheck.error || "Access denied" };
    }

    // Only SUPER_ADMIN can create SUPER_ADMIN or ADMIN users
    if (
      (input.role === "SUPER_ADMIN" || input.role === "ADMIN") &&
      currentUser.role !== "SUPER_ADMIN"
    ) {
      return { success: false, error: "Insufficient permissions to create this role" };
    }

    const supabase = await createClient();

    // Check if user with email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", input.email)
      .single();

    if (existingUser) {
      return { success: false, error: "A user with this email already exists" };
    }

    // For now, create a user profile without auth account
    // In production, you'd use Supabase Admin API to create auth users
    // This is a simplified version that creates the profile only

    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        email: input.email,
        name: input.name,
        role: input.role,
        school_id: input.schoolId,
        phone: input.phone,
      })
      .select("id")
      .single();

    if (createError) {
      return { success: false, error: "Failed to create user: " + createError.message };
    }

    // Log audit action
    await logAuditAction({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      actionType: "CREATE_USER",
      entityType: "user",
      entityId: newUser.id,
      schoolId: input.schoolId,
      changes: {
        email: input.email,
        name: input.name,
        role: input.role,
      },
    });

    revalidatePath(`/dashboard/admin/manage-users`);
    revalidatePath(`/dashboard/super-admin/impersonate/${input.schoolId}/manage-users`);

    return { success: true, data: { userId: newUser.id } };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Update an existing user
 */
export async function updateUser(input: UpdateUserInput): Promise<ServerActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const accessCheck = await validateSchoolAccess(
      currentUser.id,
      input.schoolId,
      ["SUPER_ADMIN", "ADMIN", "PRINCIPAL"]
    );

    if (!accessCheck.valid) {
      return { success: false, error: accessCheck.error || "Access denied" };
    }

    const supabase = await createClient();

    // Get current user data
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("id", input.userId)
      .single();

    if (!existingUser) {
      return { success: false, error: "User not found" };
    }

    // Verify user belongs to the school
    if (existingUser.school_id !== input.schoolId) {
      return { success: false, error: "User does not belong to this school" };
    }

    // Only SUPER_ADMIN can change roles
    if (input.role && currentUser.role !== "SUPER_ADMIN") {
      return { success: false, error: "Insufficient permissions to change roles" };
    }

    // Build update object
    const updates: Record<string, unknown> = {};
    if (input.name) updates.name = input.name;
    if (input.phone) updates.phone = input.phone;
    if (input.role) updates.role = input.role;

    const { error: updateError } = await supabase
      .from("users")
      .update(updates)
      .eq("id", input.userId);

    if (updateError) {
      return { success: false, error: "Failed to update user: " + updateError.message };
    }

    // Log audit action
    await logAuditAction({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      actionType: "UPDATE_USER",
      entityType: "user",
      entityId: input.userId,
      schoolId: input.schoolId,
      changes: {
        before: existingUser,
        after: updates,
      },
    });

    revalidatePath(`/dashboard/admin/manage-users`);
    revalidatePath(`/dashboard/super-admin/impersonate/${input.schoolId}/manage-users`);

    return { success: true };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Delete a user (soft delete by setting active = false, or hard delete)
 */
export async function deleteUser(
  userId: string,
  schoolId: number
): Promise<ServerActionResult> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const accessCheck = await validateSchoolAccess(
      currentUser.id,
      schoolId,
      ["SUPER_ADMIN", "ADMIN", "PRINCIPAL"]
    );

    if (!accessCheck.valid) {
      return { success: false, error: accessCheck.error || "Access denied" };
    }

    const supabase = await createClient();

    // Get user data before deleting
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (user.school_id !== schoolId) {
      return { success: false, error: "User does not belong to this school" };
    }

    // Cannot delete yourself
    if (userId === currentUser.id) {
      return { success: false, error: "You cannot delete your own account" };
    }

    // Delete the user profile
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", userId);

    if (deleteError) {
      return { success: false, error: "Failed to delete user: " + deleteError.message };
    }

    // Log audit action
    await logAuditAction({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      actionType: "DELETE_USER",
      entityType: "user",
      entityId: userId,
      schoolId: schoolId,
      changes: { deletedUser: user },
    });

    revalidatePath(`/dashboard/admin/manage-users`);
    revalidatePath(`/dashboard/super-admin/impersonate/${schoolId}/manage-users`);

    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Allocate a principal to a school
 * This can either assign an existing user or create a new principal
 * Only SUPER_ADMIN can call this
 */
export async function allocatePrincipalToSchool(
  input: AllocatePrincipalInput
): Promise<ServerActionResult<{ principalId: string }>> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    if (currentUser.role !== "SUPER_ADMIN") {
      return { success: false, error: "Only Super Admins can allocate principals" };
    }

    const supabase = await createClient();

    // Verify school exists
    const { data: school, error: schoolError } = await supabase
      .from("schools")
      .select("id, name")
      .eq("id", input.schoolId)
      .single();

    if (schoolError || !school) {
      return { success: false, error: "School not found" };
    }

    let principalId: string;

    if (input.principalId) {
      // Assign existing user as principal
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id, role, school_id")
        .eq("id", input.principalId)
        .single();

      if (userError || !user) {
        return { success: false, error: "User not found" };
      }

      // Update user to be principal of this school
      const { error: updateError } = await supabase
        .from("users")
        .update({
          role: "PRINCIPAL",
          school_id: input.schoolId,
        })
        .eq("id", input.principalId);

      if (updateError) {
        return { success: false, error: "Failed to allocate principal: " + updateError.message };
      }

      principalId = input.principalId;
    } else if (input.email && input.name) {
      // Create new principal
      const { data: newPrincipal, error: createError } = await supabase
        .from("users")
        .insert({
          email: input.email,
          name: input.name,
          phone: input.phone,
          role: "PRINCIPAL",
          school_id: input.schoolId,
        })
        .select("id")
        .single();

      if (createError) {
        return { success: false, error: "Failed to create principal: " + createError.message };
      }

      principalId = newPrincipal.id;
    } else {
      return { success: false, error: "Either principalId or (email and name) must be provided" };
    }

    // Log audit action
    await logAuditAction({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      actionType: "ALLOCATE_PRINCIPAL",
      entityType: "user",
      entityId: principalId,
      schoolId: input.schoolId,
      changes: {
        principalId,
        schoolId: input.schoolId,
        schoolName: school.name,
      },
    });

    revalidatePath(`/dashboard/super-admin/schools`);
    revalidatePath(`/dashboard/super-admin/impersonate/${input.schoolId}`);

    return { success: true, data: { principalId } };
  } catch (error) {
    console.error("Allocate principal error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get all users for a school
 */
export async function getSchoolUsers(schoolId: number) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    const accessCheck = await validateSchoolAccess(currentUser.id, schoolId);

    if (!accessCheck.valid) {
      return { success: false, error: accessCheck.error || "Access denied" };
    }

    const supabase = await createClient();

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: "Failed to fetch users" };
    }

    return { success: true, data: users };
  } catch (error) {
    console.error("Get school users error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get all principals for a school
 */
export async function getSchoolPrincipals(schoolId: number) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    // Only SUPER_ADMIN can view principals across schools
    if (currentUser.role !== "SUPER_ADMIN") {
      const accessCheck = await validateSchoolAccess(currentUser.id, schoolId);
      if (!accessCheck.valid) {
        return { success: false, error: accessCheck.error || "Access denied" };
      }
    }

    const supabase = await createClient();

    const { data: principals, error } = await supabase
      .from("users")
      .select("*")
      .eq("school_id", schoolId)
      .eq("role", "PRINCIPAL")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: "Failed to fetch principals" };
    }

    return { success: true, data: principals };
  } catch (error) {
    console.error("Get school principals error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
