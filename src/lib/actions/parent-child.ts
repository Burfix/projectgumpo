"use server";

/**
 * Server actions for linking parents to children
 * These actions enforce proper authorization and audit logging
 */

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, logAuditAction, validateSchoolAccess } from "@/lib/auth/audit";
import { revalidatePath } from "next/cache";

export interface LinkParentToChildInput {
  parentId: string;
  childId: number;
  schoolId: number;
  relationshipType?: "Parent" | "Guardian" | "Emergency Contact";
}

export interface ServerActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Link a parent/guardian to a child
 * Can be called by SUPER_ADMIN (for any school) or ADMIN/PRINCIPAL (for their school)
 */
export async function linkParentToChild(
  input: LinkParentToChildInput
): Promise<ServerActionResult<{ id: number }>> {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate school access
    const accessCheck = await validateSchoolAccess(
      currentUser.id,
      input.schoolId,
      ["SUPER_ADMIN", "ADMIN", "PRINCIPAL"]
    );

    if (!accessCheck.valid) {
      return { success: false, error: accessCheck.error || "Access denied" };
    }

    const supabase = await createClient();

    // Verify child belongs to the specified school
    const { data: child, error: childError } = await supabase
      .from("children")
      .select("school_id")
      .eq("id", input.childId)
      .single();

    if (childError || !child) {
      return { success: false, error: "Child not found" };
    }

    if (child.school_id !== input.schoolId) {
      return { success: false, error: "Child does not belong to this school" };
    }

    // Verify parent exists
    const { data: parent, error: parentError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", input.parentId)
      .single();

    if (parentError || !parent) {
      return { success: false, error: "Parent user not found" };
    }

    // Insert the parent-child link
    const { data: link, error: linkError } = await supabase
      .from("parent_child")
      .insert({
        parent_id: input.parentId,
        child_id: input.childId,
        school_id: input.schoolId,
        relationship_type: input.relationshipType || "Parent",
        created_by: currentUser.id,
      })
      .select("id")
      .single();

    if (linkError) {
      if (linkError.code === "23505") {
        // Unique constraint violation
        return { success: false, error: "This parent is already linked to this child" };
      }
      return { success: false, error: "Failed to create link: " + linkError.message };
    }

    // Log audit action
    await logAuditAction({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      actionType: "LINK_PARENT_TO_CHILD",
      entityType: "parent_child",
      entityId: String(link.id),
      schoolId: input.schoolId,
      changes: {
        parentId: input.parentId,
        childId: input.childId,
        relationshipType: input.relationshipType || "Parent",
      },
    });

    // Revalidate relevant pages
    revalidatePath(`/dashboard/admin/link-parent-to-child`);
    revalidatePath(`/dashboard/super-admin/impersonate/${input.schoolId}/link-parent-to-child`);

    return { success: true, data: { id: link.id } };
  } catch (error) {
    console.error("Link parent to child error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Unlink a parent from a child
 */
export async function unlinkParentFromChild(
  linkId: number,
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

    // Get link details before deleting (for audit log)
    const { data: link } = await supabase
      .from("parent_child")
      .select("parent_id, child_id, school_id")
      .eq("id", linkId)
      .single();

    if (link && link.school_id !== schoolId) {
      return { success: false, error: "Link does not belong to this school" };
    }

    // Delete the link
    const { error: deleteError } = await supabase
      .from("parent_child")
      .delete()
      .eq("id", linkId);

    if (deleteError) {
      return { success: false, error: "Failed to unlink: " + deleteError.message };
    }

    // Log audit action
    await logAuditAction({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      actionType: "UNLINK_PARENT_FROM_CHILD",
      entityType: "parent_child",
      entityId: String(linkId),
      schoolId: schoolId,
      changes: link || {},
    });

    revalidatePath(`/dashboard/admin/link-parent-to-child`);
    revalidatePath(`/dashboard/super-admin/impersonate/${schoolId}/link-parent-to-child`);

    return { success: true };
  } catch (error) {
    console.error("Unlink parent from child error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get all parent-child links for a school
 */
export async function getParentChildLinks(schoolId: number) {
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

    const { data: links, error } = await supabase
      .from("parent_child")
      .select(
        `
        id,
        relationship_type,
        created_at,
        parent:parent_id (id, name, email),
        child:child_id (id, first_name, last_name)
      `
      )
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: "Failed to fetch links" };
    }

    return { success: true, data: links };
  } catch (error) {
    console.error("Get parent-child links error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
