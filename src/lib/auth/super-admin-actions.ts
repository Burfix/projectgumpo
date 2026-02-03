"use server";

import { createClient } from "@/lib/supabase/server";
import { protectRoute } from "@/lib/auth/middleware";

/**
 * Super Admin write actions scoped to active school
 * All actions require:
 * 1. User is SUPER_ADMIN
 * 2. Target records belong to the activeSchoolId
 * 3. Audit logging
 */

interface LinkParentToChildInput {
  parentId: string;
  childId: string;
  schoolId: string;
}

interface UnlinkParentToChildInput {
  parentId: string;
  childId: string;
  schoolId: string;
}

/**
 * Link a parent to a child (SUPER_ADMIN only)
 */
export async function linkParentToChild(input: LinkParentToChildInput) {
  const { parentId, childId, schoolId } = input;

  // 1. Verify user is SUPER_ADMIN
  const user = await protectRoute(["SUPER_ADMIN"]);

  // 2. Create server client
  const supabase = await createClient();

  // 3. Verify both parent and child belong to the specified school
  const [parentUser, childUser] = await Promise.all([
    supabase
      .from("users")
      .select("id, school_id, role")
      .eq("id", parentId)
      .eq("school_id", schoolId)
      .single(),
    supabase
      .from("users")
      .select("id, school_id, role")
      .eq("id", childId)
      .eq("school_id", schoolId)
      .single(),
  ]);

  if (parentUser.error || !parentUser.data) {
    return { success: false, error: "Parent not found in school" };
  }

  if (childUser.error || !childUser.data) {
    return { success: false, error: "Child not found in school" };
  }

  // Verify parent role is PARENT or TEACHER
  if (!["PARENT", "TEACHER"].includes(parentUser.data.role)) {
    return { success: false, error: "Parent must have PARENT or TEACHER role" };
  }

  // 4. Insert into parent_child junction table (create if doesn't exist)
  const { data, error } = await supabase
    .from("parent_child")
    .insert({
      parent_id: parentId,
      child_id: childId,
      school_id: schoolId,
    })
    .select();

  if (error) {
    console.error("Link parent to child error:", error);
    return { success: false, error: error.message };
  }

  // 5. Audit log
  await supabase.from("super_admin_audit").insert({
    actor_user_id: user.id,
    school_id: schoolId,
    action_type: "CREATE_LINK",
    entity_type: "parent_child",
    entity_id: `${parentId}_${childId}`,
    changes: {
      action: "linked",
      parent_id: parentId,
      child_id: childId,
    },
  });

  return { success: true, data };
}

/**
 * Unlink a parent from a child (SUPER_ADMIN only)
 */
export async function unlinkParentToChild(input: UnlinkParentToChildInput) {
  const { parentId, childId, schoolId } = input;

  // 1. Verify user is SUPER_ADMIN
  const user = await protectRoute(["SUPER_ADMIN"]);

  // 2. Create server client
  const supabase = await createClient();

  // 3. Delete the link
  const { error } = await supabase
    .from("parent_child")
    .delete()
    .eq("parent_id", parentId)
    .eq("child_id", childId)
    .eq("school_id", schoolId);

  if (error) {
    console.error("Unlink parent to child error:", error);
    return { success: false, error: error.message };
  }

  // 4. Audit log
  await supabase.from("super_admin_audit").insert({
    actor_user_id: user.id,
    school_id: schoolId,
    action_type: "DELETE_LINK",
    entity_type: "parent_child",
    entity_id: `${parentId}_${childId}`,
    changes: {
      action: "unlinked",
      parent_id: parentId,
      child_id: childId,
    },
  });

  return { success: true };
}

interface AssignTeacherToClassInput {
  teacherId: string;
  classroomId: string;
  schoolId: string;
}

/**
 * Assign a teacher to a classroom (SUPER_ADMIN only)
 */
export async function assignTeacherToClass(input: AssignTeacherToClassInput) {
  const { teacherId, classroomId, schoolId } = input;

  // 1. Verify user is SUPER_ADMIN
  const user = await protectRoute(["SUPER_ADMIN"]);

  // 2. Create server client
  const supabase = await createClient();

  // 3. Verify teacher belongs to school
  const { data: teacher, error: teacherError } = await supabase
    .from("users")
    .select("id, school_id, role")
    .eq("id", teacherId)
    .eq("school_id", schoolId)
    .single();

  if (teacherError || !teacher) {
    return { success: false, error: "Teacher not found in school" };
  }

  if (teacher.role !== "TEACHER") {
    return { success: false, error: "User must have TEACHER role" };
  }

  // 4. Verify classroom belongs to school
  const { data: classroom, error: classroomError } = await supabase
    .from("classrooms")
    .select("id, school_id")
    .eq("id", classroomId)
    .eq("school_id", schoolId)
    .single();

  if (classroomError || !classroom) {
    return { success: false, error: "Classroom not found in school" };
  }

  // 5. Insert assignment
  const { data, error } = await supabase
    .from("teacher_classroom")
    .insert({
      teacher_id: teacherId,
      classroom_id: classroomId,
      school_id: schoolId,
    })
    .select();

  if (error) {
    console.error("Assign teacher error:", error);
    return { success: false, error: error.message };
  }

  // 6. Audit log
  await supabase.from("super_admin_audit").insert({
    actor_user_id: user.id,
    school_id: schoolId,
    action_type: "ASSIGN_TEACHER",
    entity_type: "teacher_classroom",
    entity_id: `${teacherId}_${classroomId}`,
    changes: {
      action: "assigned",
      teacher_id: teacherId,
      classroom_id: classroomId,
    },
  });

  return { success: true, data };
}

interface UnassignTeacherFromClassInput {
  teacherId: string;
  classroomId: string;
  schoolId: string;
}

/**
 * Unassign a teacher from a classroom (SUPER_ADMIN only)
 */
export async function unassignTeacherFromClass(
  input: UnassignTeacherFromClassInput
) {
  const { teacherId, classroomId, schoolId } = input;

  // 1. Verify user is SUPER_ADMIN
  const user = await protectRoute(["SUPER_ADMIN"]);

  // 2. Create server client
  const supabase = await createClient();

  // 3. Delete assignment
  const { error } = await supabase
    .from("teacher_classroom")
    .delete()
    .eq("teacher_id", teacherId)
    .eq("classroom_id", classroomId)
    .eq("school_id", schoolId);

  if (error) {
    console.error("Unassign teacher error:", error);
    return { success: false, error: error.message };
  }

  // 4. Audit log
  await supabase.from("super_admin_audit").insert({
    actor_user_id: user.id,
    school_id: schoolId,
    action_type: "UNASSIGN_TEACHER",
    entity_type: "teacher_classroom",
    entity_id: `${teacherId}_${classroomId}`,
    changes: {
      action: "unassigned",
      teacher_id: teacherId,
      classroom_id: classroomId,
    },
  });

  return { success: true };
}

interface AllocatePrincipalInput {
  userId: string;
  schoolId: string;
}

/**
 * Allocate a user as PRINCIPAL for a school (SUPER_ADMIN only)
 * A school can have multiple principals
 */
export async function allocatePrincipalToSchool(input: AllocatePrincipalInput) {
  const { userId, schoolId } = input;

  // 1. Verify user is SUPER_ADMIN
  const superAdmin = await protectRoute(["SUPER_ADMIN"]);

  // 2. Create server client
  const supabase = await createClient();

  // 3. Verify user exists and belongs to school
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, school_id, role, name, email")
    .eq("id", userId)
    .eq("school_id", schoolId)
    .single();

  if (userError || !user) {
    return { success: false, error: "User not found in school" };
  }

  // 4. Update user role to PRINCIPAL
  const { error: updateError } = await supabase
    .from("users")
    .update({ role: "PRINCIPAL" })
    .eq("id", userId)
    .eq("school_id", schoolId);

  if (updateError) {
    console.error("Allocate principal error:", updateError);
    return { success: false, error: updateError.message };
  }

  // 5. Audit log
  await supabase.from("super_admin_audit").insert({
    actor_user_id: superAdmin.id,
    school_id: schoolId,
    action_type: "ALLOCATE_PRINCIPAL",
    entity_type: "principal",
    entity_id: userId,
    changes: {
      action: "promoted_to_principal",
      user_id: userId,
      user_name: user.name,
      user_email: user.email,
      previous_role: user.role,
      new_role: "PRINCIPAL",
    },
  });

  return { success: true, data: { id: userId, role: "PRINCIPAL" } };
}

interface RemovePrincipalInput {
  userId: string;
  schoolId: string;
  newRole?: string; // Fallback role, default "ADMIN"
}

/**
 * Remove a principal designation (demote) (SUPER_ADMIN only)
 */
export async function removePrincipalFromSchool(input: RemovePrincipalInput) {
  const { userId, schoolId, newRole = "ADMIN" } = input;

  // 1. Verify user is SUPER_ADMIN
  const superAdmin = await protectRoute(["SUPER_ADMIN"]);

  // 2. Create server client
  const supabase = await createClient();

  // 3. Verify user exists and is a PRINCIPAL
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, school_id, role, name, email")
    .eq("id", userId)
    .eq("school_id", schoolId)
    .single();

  if (userError || !user) {
    return { success: false, error: "User not found in school" };
  }

  if (user.role !== "PRINCIPAL") {
    return { success: false, error: "User is not a principal" };
  }

  // 4. Update user role
  const { error: updateError } = await supabase
    .from("users")
    .update({ role: newRole })
    .eq("id", userId)
    .eq("school_id", schoolId);

  if (updateError) {
    console.error("Remove principal error:", updateError);
    return { success: false, error: updateError.message };
  }

  // 5. Audit log
  await supabase.from("super_admin_audit").insert({
    actor_user_id: superAdmin.id,
    school_id: schoolId,
    action_type: "REMOVE_PRINCIPAL",
    entity_type: "principal",
    entity_id: userId,
    changes: {
      action: "demoted_from_principal",
      user_id: userId,
      user_name: user.name,
      user_email: user.email,
      previous_role: "PRINCIPAL",
      new_role: newRole,
    },
  });

  return { success: true, data: { id: userId, role: newRole } };
}
