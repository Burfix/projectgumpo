"use server";

/**
 * Server actions for assigning teachers to classrooms
 * These actions enforce proper authorization and audit logging
 */

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, logAuditAction, validateSchoolAccess } from "@/lib/auth/audit";
import { revalidatePath } from "next/cache";
import { ServerActionResult } from "./parent-child";

export interface AssignTeacherToClassInput {
  teacherId: string;
  classroomId: number;
  schoolId: number;
}

/**
 * Assign a teacher to a classroom
 * Can be called by SUPER_ADMIN (for any school) or ADMIN/PRINCIPAL (for their school)
 */
export async function assignTeacherToClass(
  input: AssignTeacherToClassInput
): Promise<ServerActionResult<{ id: number }>> {
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

    // Verify classroom belongs to the specified school
    const { data: classroom, error: classroomError } = await supabase
      .from("classrooms")
      .select("school_id, name")
      .eq("id", input.classroomId)
      .single();

    if (classroomError || !classroom) {
      return { success: false, error: "Classroom not found" };
    }

    if (classroom.school_id !== input.schoolId) {
      return { success: false, error: "Classroom does not belong to this school" };
    }

    // Verify teacher exists and belongs to the school (or is SUPER_ADMIN)
    const { data: teacher, error: teacherError } = await supabase
      .from("users")
      .select("id, role, school_id, name")
      .eq("id", input.teacherId)
      .single();

    if (teacherError || !teacher) {
      return { success: false, error: "Teacher user not found" };
    }

    if (teacher.role !== "TEACHER" && teacher.role !== "ADMIN" && teacher.role !== "PRINCIPAL") {
      return { success: false, error: "User is not a teacher" };
    }

    if (teacher.school_id !== input.schoolId) {
      return { success: false, error: "Teacher does not belong to this school" };
    }

    // Insert the teacher-classroom assignment
    const { data: assignment, error: assignError } = await supabase
      .from("teacher_classroom")
      .insert({
        teacher_id: input.teacherId,
        classroom_id: input.classroomId,
        school_id: input.schoolId,
        assigned_by: currentUser.id,
      })
      .select("id")
      .single();

    if (assignError) {
      if (assignError.code === "23505") {
        return { success: false, error: "This teacher is already assigned to this classroom" };
      }
      return { success: false, error: "Failed to create assignment: " + assignError.message };
    }

    // Log audit action
    await logAuditAction({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      actionType: "ASSIGN_TEACHER_TO_CLASS",
      entityType: "teacher_classroom",
      entityId: String(assignment.id),
      schoolId: input.schoolId,
      changes: {
        teacherId: input.teacherId,
        teacherName: teacher.name,
        classroomId: input.classroomId,
        classroomName: classroom.name,
      },
    });

    revalidatePath(`/dashboard/admin/assign-teacher-to-class`);
    revalidatePath(`/dashboard/super-admin/impersonate/${input.schoolId}/assign-teacher-to-class`);

    return { success: true, data: { id: assignment.id } };
  } catch (error) {
    console.error("Assign teacher to class error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Unassign a teacher from a classroom
 */
export async function unassignTeacherFromClass(
  assignmentId: number,
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

    // Get assignment details before deleting (for audit log)
    const { data: assignment } = await supabase
      .from("teacher_classroom")
      .select("teacher_id, classroom_id, school_id")
      .eq("id", assignmentId)
      .single();

    if (assignment && assignment.school_id !== schoolId) {
      return { success: false, error: "Assignment does not belong to this school" };
    }

    // Delete the assignment
    const { error: deleteError } = await supabase
      .from("teacher_classroom")
      .delete()
      .eq("id", assignmentId);

    if (deleteError) {
      return { success: false, error: "Failed to unassign: " + deleteError.message };
    }

    // Log audit action
    await logAuditAction({
      actorUserId: currentUser.id,
      actorRole: currentUser.role,
      actionType: "UNASSIGN_TEACHER_FROM_CLASS",
      entityType: "teacher_classroom",
      entityId: String(assignmentId),
      schoolId: schoolId,
      changes: assignment || {},
    });

    revalidatePath(`/dashboard/admin/assign-teacher-to-class`);
    revalidatePath(`/dashboard/super-admin/impersonate/${schoolId}/assign-teacher-to-class`);

    return { success: true };
  } catch (error) {
    console.error("Unassign teacher from class error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get all teacher-classroom assignments for a school
 */
export async function getTeacherClassAssignments(schoolId: number) {
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

    const { data: assignments, error } = await supabase
      .from("teacher_classroom")
      .select(
        `
        id,
        assigned_at,
        teacher:teacher_id (id, name, email),
        classroom:classroom_id (id, name, capacity, age_group)
      `
      )
      .eq("school_id", schoolId)
      .order("assigned_at", { ascending: false });

    if (error) {
      return { success: false, error: "Failed to fetch assignments" };
    }

    return { success: true, data: assignments };
  } catch (error) {
    console.error("Get teacher-class assignments error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get available teachers for a school (not yet assigned to a specific classroom)
 */
export async function getAvailableTeachers(schoolId: number, excludeClassroomId?: number) {
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

    let query = supabase
      .from("users")
      .select("id, name, email, role")
      .eq("school_id", schoolId)
      .in("role", ["TEACHER", "ADMIN", "PRINCIPAL"]);

    const { data: teachers, error } = await query;

    if (error) {
      return { success: false, error: "Failed to fetch teachers" };
    }

    return { success: true, data: teachers };
  } catch (error) {
    console.error("Get available teachers error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Get all classrooms for a school
 */
export async function getSchoolClassrooms(schoolId: number) {
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

    const { data: classrooms, error } = await supabase
      .from("classrooms")
      .select("*")
      .eq("school_id", schoolId)
      .order("name");

    if (error) {
      return { success: false, error: "Failed to fetch classrooms" };
    }

    return { success: true, data: classrooms };
  } catch (error) {
    console.error("Get school classrooms error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
