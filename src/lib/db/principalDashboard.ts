import { createClient } from "@/lib/supabase/server";

/**
 * Database helpers for the Principal (Admin) Dashboard
 */

// ============================================================
// HELPER: Get authenticated user and verify school access
// ============================================================
async function getAuthenticatedPrincipal() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("Not authenticated. Please log in.");
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    console.error("User lookup error:", userError);
    throw new Error("User not found in database");
  }

  if (!userData.school_id) {
    throw new Error("User not associated with a school");
  }

  // Allow ADMIN, PRINCIPAL, and SUPER_ADMIN (for testing)
  const allowedRoles = ['ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'];
  if (!allowedRoles.includes(userData.role)) {
    throw new Error(`Access denied. Your role is '${userData.role}'. Admin dashboard requires ADMIN or PRINCIPAL role.`);
  }

  return { user: userData, supabase };
}

// ============================================================
// DASHBOARD OVERVIEW
// ============================================================
export async function getDashboardStats() {
  const { user, supabase } = await getAuthenticatedPrincipal();

  // Get school info
  const { data: school } = await supabase
    .from("schools")
    .select("*")
    .eq("id", user.school_id)
    .single();

  // Get counts
  const [
    { count: childrenCount },
    { count: teachersCount },
    { count: parentsCount },
    { count: classroomsCount },
  ] = await Promise.all([
    supabase.from("children").select("*", { count: "exact", head: true }).eq("school_id", user.school_id).eq("status", "active"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("school_id", user.school_id).eq("role", "TEACHER"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("school_id", user.school_id).eq("role", "PARENT"),
    supabase.from("classrooms").select("*", { count: "exact", head: true }).eq("school_id", user.school_id).eq("status", "active"),
  ]);

  // Get recent activities (last 10)
  const { data: recentActivities } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("school_id", user.school_id)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    school,
    stats: {
      children: childrenCount || 0,
      teachers: teachersCount || 0,
      parents: parentsCount || 0,
      classrooms: classroomsCount || 0,
    },
    recentActivities: recentActivities || [],
  };
}

// ============================================================
// TEACHERS MANAGEMENT
// ============================================================
export async function getTeachers() {
  const { user, supabase } = await getAuthenticatedPrincipal();

  const { data, error } = await supabase
    .from("users")
    .select(`
      *,
      teacher_classroom (
        classroom_id,
        classrooms (
          id,
          name
        )
      )
    `)
    .eq("school_id", user.school_id)
    .eq("role", "TEACHER")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function inviteTeacher(email: string, name: string) {
  const { user, supabase } = await getAuthenticatedPrincipal();

  // Check if user already exists
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    throw new Error("User with this email already exists");
  }

  // Create invite
  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  const { data, error } = await supabase
    .from("invites")
    .insert({
      school_id: user.school_id,
      email,
      role: "TEACHER",
      invited_by: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTeacher(teacherId: string) {
  const { user, supabase } = await getAuthenticatedPrincipal();

  // Verify teacher belongs to same school
  const { data: teacher } = await supabase
    .from("users")
    .select("school_id")
    .eq("id", teacherId)
    .single();

  if (!teacher || teacher.school_id !== user.school_id) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("users")
    .delete()
    .eq("id", teacherId);

  if (error) throw error;
  return { success: true };
}

// ============================================================
// CHILDREN MANAGEMENT
// ============================================================
export async function getChildren() {
  const { user, supabase } = await getAuthenticatedPrincipal();

  const { data, error } = await supabase
    .from("children")
    .select(`
      *,
      classrooms (
        id,
        name,
        age_group
      ),
      parent_child (
        users (
          id,
          name,
          email,
          phone
        )
      )
    `)
    .eq("school_id", user.school_id)
    .order("first_name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addChild(childData: {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender?: string;
  classroom_id?: number;
  allergies?: string;
  medical_notes?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}) {
  const { user, supabase } = await getAuthenticatedPrincipal();

  const { data, error } = await supabase
    .from("children")
    .insert({
      ...childData,
      school_id: user.school_id,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateChild(childId: number, updates: Record<string, any>) {
  const { user, supabase } = await getAuthenticatedPrincipal();

  // Verify child belongs to same school
  const { data: child } = await supabase
    .from("children")
    .select("school_id")
    .eq("id", childId)
    .single();

  if (!child || child.school_id !== user.school_id) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("children")
    .update(updates)
    .eq("id", childId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteChild(childId: number) {
  const { user, supabase } = await getAuthenticatedPrincipal();

  const { data: child } = await supabase
    .from("children")
    .select("school_id")
    .eq("id", childId)
    .single();

  if (!child || child.school_id !== user.school_id) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("children")
    .delete()
    .eq("id", childId);

  if (error) throw error;
  return { success: true };
}

// ============================================================
// PARENTS MANAGEMENT
// ============================================================
export async function getParents() {
  const { user, supabase } = await getAuthenticatedPrincipal();

  const { data, error } = await supabase
    .from("users")
    .select(`
      *,
      parent_child (
        children (
          id,
          first_name,
          last_name
        )
      )
    `)
    .eq("school_id", user.school_id)
    .eq("role", "PARENT")
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function inviteParent(email: string, name: string) {
  const { user, supabase } = await getAuthenticatedPrincipal();

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    throw new Error("User with this email already exists");
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { data, error } = await supabase
    .from("invites")
    .insert({
      school_id: user.school_id,
      email,
      role: "PARENT",
      invited_by: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function linkParentToChild(parentId: string, childId: number, relationship: string = "parent") {
  const { user, supabase } = await getAuthenticatedPrincipal();

  // Verify both parent and child belong to same school
  const [{ data: parent }, { data: child }] = await Promise.all([
    supabase.from("users").select("school_id").eq("id", parentId).single(),
    supabase.from("children").select("school_id").eq("id", childId).single(),
  ]);

  if (!parent || !child || parent.school_id !== user.school_id || child.school_id !== user.school_id) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("parent_child")
    .insert({
      parent_id: parentId,
      child_id: childId,
      relationship,
      school_id: user.school_id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unlinkParentFromChild(parentId: string, childId: number) {
  const { user, supabase } = await getAuthenticatedPrincipal();

  const { error } = await supabase
    .from("parent_child")
    .delete()
    .eq("parent_id", parentId)
    .eq("child_id", childId)
    .eq("school_id", user.school_id);

  if (error) throw error;
  return { success: true };
}

// ============================================================
// CLASSROOMS MANAGEMENT
// ============================================================
export async function getClassrooms() {
  const { user, supabase } = await getAuthenticatedPrincipal();

  const { data, error } = await supabase
    .from("classrooms")
    .select(`
      *,
      children (id),
      teacher_classroom (
        users (
          id,
          name,
          email
        )
      )
    `)
    .eq("school_id", user.school_id)
    .order("name", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function addClassroom(classroomData: {
  name: string;
  age_group?: string;
  capacity?: number;
}) {
  const { user, supabase } = await getAuthenticatedPrincipal();

  const { data, error } = await supabase
    .from("classrooms")
    .insert({
      ...classroomData,
      school_id: user.school_id,
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateClassroom(classroomId: number, updates: Record<string, any>) {
  const { user, supabase } = await getAuthenticatedPrincipal();

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("school_id")
    .eq("id", classroomId)
    .single();

  if (!classroom || classroom.school_id !== user.school_id) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("classrooms")
    .update(updates)
    .eq("id", classroomId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClassroom(classroomId: number) {
  const { user, supabase } = await getAuthenticatedPrincipal();

  const { data: classroom } = await supabase
    .from("classrooms")
    .select("school_id")
    .eq("id", classroomId)
    .single();

  if (!classroom || classroom.school_id !== user.school_id) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("classrooms")
    .delete()
    .eq("id", classroomId);

  if (error) throw error;
  return { success: true };
}

export async function assignTeacherToClassroom(teacherId: string, classroomId: number, isPrimary: boolean = false) {
  const { user, supabase } = await getAuthenticatedPrincipal();

  const { data, error } = await supabase
    .from("teacher_classroom")
    .insert({
      teacher_id: teacherId,
      classroom_id: classroomId,
      school_id: user.school_id,
      is_primary: isPrimary,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeTeacherFromClassroom(teacherId: string, classroomId: number) {
  const { user, supabase } = await getAuthenticatedPrincipal();

  const { error } = await supabase
    .from("teacher_classroom")
    .delete()
    .eq("teacher_id", teacherId)
    .eq("classroom_id", classroomId)
    .eq("school_id", user.school_id);

  if (error) throw error;
  return { success: true };
}

// ============================================================
// SCHOOL SETTINGS
// ============================================================
export async function getSchoolSettings() {
  const { user, supabase } = await getAuthenticatedPrincipal();

  const { data, error } = await supabase
    .from("schools")
    .select("*")
    .eq("id", user.school_id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateSchoolSettings(updates: Record<string, any>) {
  const { user, supabase } = await getAuthenticatedPrincipal();

  const { data, error } = await supabase
    .from("schools")
    .update(updates)
    .eq("id", user.school_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
