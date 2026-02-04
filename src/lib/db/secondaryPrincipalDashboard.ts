import { createClient } from "@/lib/supabase/server";

/**
 * Data layer functions for Secondary Principal Dashboard
 * All queries are school-scoped via RLS policies
 */

export interface DashboardStats {
  totalTeachers: number;
  totalParents: number;
  totalChildren: number;
  totalClasses: number;
  activeSubscription: boolean;
  monthlyRevenue: number;
  pendingIncidents: number;
  todayAttendance: number;
}

export interface Teacher {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  created_at: string;
  assigned_classes?: number;
}

export interface Parent {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  created_at: string;
  linked_children?: number;
}

export interface Child {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  grade?: string;
  classroom_id?: number;
  classroom_name?: string;
  parent_names?: string[];
}

export interface Classroom {
  id: number;
  name: string;
  grade_level?: string;
  capacity?: number;
  teacher_count: number;
  student_count: number;
  created_at: string;
}

export interface Subscription {
  id: number;
  subscription_type: string;
  status: string;
  start_date: string;
  end_date?: string;
  monthly_amount: number;
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string;
  paid_date?: string;
  created_at: string;
}

export interface OperationsSummary {
  attendance: {
    total_today: number;
    present: number;
    absent: number;
    late: number;
  };
  incidents: {
    total_today: number;
    pending: number;
    resolved: number;
  };
  meals: {
    total_today: number;
    breakfast: number;
    lunch: number;
    snack: number;
  };
  messages: {
    unread: number;
    total_today: number;
  };
}

/**
 * Get current user profile with school_id
 */
async function getCurrentUserProfile() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error("Auth error:", authError);
    throw new Error("Not authenticated");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, role, school_id, name, email")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Profile query error:", profileError);
    throw new Error(`User profile not found: ${profileError.message}`);
  }
  
  if (!profile) {
    console.error("No profile returned for user:", user.id);
    throw new Error("User profile not found");
  }

  // Use default school if no school_id assigned
  const resolvedSchoolId = profile.school_id || 'a0000000-0000-0000-0000-000000000001';

  return {
    ...profile,
    school_id: resolvedSchoolId,
  };
}

/**
 * Get dashboard overview statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  // Count teachers
  const { count: teacherCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("school_id", profile.school_id)
    .eq("role", "TEACHER");

  // Count parents
  const { count: parentCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("school_id", profile.school_id)
    .eq("role", "PARENT");

  // Count children
  const { count: childCount } = await supabase
    .from("children")
    .select("*", { count: "exact", head: true })
    .eq("school_id", profile.school_id);

  // Count classrooms
  const { count: classCount } = await supabase
    .from("classrooms")
    .select("*", { count: "exact", head: true })
    .eq("school_id", profile.school_id);

  // Check active subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, monthly_amount")
    .eq("school_id", profile.school_id)
    .eq("status", "active")
    .maybeSingle();

  // Count pending incidents
  const { count: incidentCount } = await supabase
    .from("incident_reports")
    .select("*", { count: "exact", head: true })
    .eq("school_id", profile.school_id)
    .eq("status", "pending");

  // Count today's attendance
  const today = new Date().toISOString().split('T')[0];
  const { count: attendanceCount } = await supabase
    .from("attendance_logs")
    .select("*", { count: "exact", head: true })
    .eq("school_id", profile.school_id)
    .gte("date", today)
    .lte("date", today);

  return {
    totalTeachers: teacherCount || 0,
    totalParents: parentCount || 0,
    totalChildren: childCount || 0,
    totalClasses: classCount || 0,
    activeSubscription: subscription?.status === "active",
    monthlyRevenue: subscription?.monthly_amount || 0,
    pendingIncidents: incidentCount || 0,
    todayAttendance: attendanceCount || 0,
  };
}

/**
 * Get all teachers for the school
 */
export async function getTeachers(): Promise<Teacher[]> {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      email,
      full_name,
      phone_number,
      created_at
    `)
    .eq("school_id", profile.school_id)
    .eq("role", "TEACHER")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }

  // Count assigned classes for each teacher
  const teachersWithClasses = await Promise.all(
    (data || []).map(async (teacher) => {
      const { count } = await supabase
        .from("teacher_classroom")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", teacher.id);

      return {
        ...teacher,
        assigned_classes: count || 0,
      };
    })
  );

  return teachersWithClasses;
}

/**
 * Get all parents for the school
 */
export async function getParents(): Promise<Parent[]> {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      email,
      full_name,
      phone_number,
      created_at
    `)
    .eq("school_id", profile.school_id)
    .eq("role", "PARENT")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Error fetching parents:", error);
    return [];
  }

  // Count linked children for each parent
  const parentsWithChildren = await Promise.all(
    (data || []).map(async (parent) => {
      const { count } = await supabase
        .from("parent_child")
        .select("*", { count: "exact", head: true })
        .eq("parent_id", parent.id);

      return {
        ...parent,
        linked_children: count || 0,
      };
    })
  );

  return parentsWithChildren;
}

/**
 * Get all children for the school
 */
export async function getChildren(): Promise<Child[]> {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  const { data, error } = await supabase
    .from("children")
    .select(`
      id,
      first_name,
      last_name,
      date_of_birth,
      grade,
      classroom_id,
      classrooms (
        name
      )
    `)
    .eq("school_id", profile.school_id)
    .order("last_name", { ascending: true });

  if (error) {
    console.error("Error fetching children:", error);
    return [];
  }

  // Get parent names for each child
  const childrenWithParents = await Promise.all(
    (data || []).map(async (child: any) => {
      const { data: parentLinks } = await supabase
        .from("parent_child")
        .select(`
          users (
            full_name
          )
        `)
        .eq("child_id", child.id);

      const parentNames = parentLinks?.map((link: any) => link.users?.full_name).filter(Boolean) || [];

      return {
        id: child.id,
        first_name: child.first_name,
        last_name: child.last_name,
        date_of_birth: child.date_of_birth,
        grade: child.grade,
        classroom_id: child.classroom_id,
        classroom_name: child.classrooms?.name,
        parent_names: parentNames,
      };
    })
  );

  return childrenWithParents;
}

/**
 * Get all classrooms for the school
 */
export async function getClassrooms(): Promise<Classroom[]> {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  const { data, error } = await supabase
    .from("classrooms")
    .select(`
      id,
      name,
      grade_level,
      capacity,
      created_at
    `)
    .eq("school_id", profile.school_id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching classrooms:", error);
    return [];
  }

  // Count teachers and students for each classroom
  const classroomsWithCounts = await Promise.all(
    (data || []).map(async (classroom) => {
      const { count: teacherCount } = await supabase
        .from("teacher_classroom")
        .select("*", { count: "exact", head: true })
        .eq("classroom_id", classroom.id);

      const { count: studentCount } = await supabase
        .from("children")
        .select("*", { count: "exact", head: true })
        .eq("classroom_id", classroom.id);

      return {
        ...classroom,
        teacher_count: teacherCount || 0,
        student_count: studentCount || 0,
      };
    })
  );

  return classroomsWithCounts;
}

/**
 * Get subscription for the school
 */
export async function getSubscription(): Promise<Subscription | null> {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("school_id", profile.school_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }

  return data;
}

/**
 * Get invoices for the school
 */
export async function getInvoices(): Promise<Invoice[]> {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("school_id", profile.school_id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }

  return data || [];
}

/**
 * Get operations summary for today
 */
export async function getOperationsSummary(): Promise<OperationsSummary> {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();
  const today = new Date().toISOString().split('T')[0];

  // Attendance stats
  const { data: attendanceData } = await supabase
    .from("attendance_logs")
    .select("status")
    .eq("school_id", profile.school_id)
    .gte("date", today)
    .lte("date", today);

  const attendanceStats = {
    total_today: attendanceData?.length || 0,
    present: attendanceData?.filter((a) => a.status === "present").length || 0,
    absent: attendanceData?.filter((a) => a.status === "absent").length || 0,
    late: attendanceData?.filter((a) => a.status === "late").length || 0,
  };

  // Incident stats
  const { data: incidentData } = await supabase
    .from("incident_reports")
    .select("status")
    .eq("school_id", profile.school_id)
    .gte("incident_date", today)
    .lte("incident_date", today);

  const incidentStats = {
    total_today: incidentData?.length || 0,
    pending: incidentData?.filter((i) => i.status === "pending").length || 0,
    resolved: incidentData?.filter((i) => i.status === "resolved").length || 0,
  };

  // Meal stats
  const { data: mealData } = await supabase
    .from("meal_logs")
    .select("meal_type")
    .eq("school_id", profile.school_id)
    .gte("date", today)
    .lte("date", today);

  const mealStats = {
    total_today: mealData?.length || 0,
    breakfast: mealData?.filter((m) => m.meal_type === "breakfast").length || 0,
    lunch: mealData?.filter((m) => m.meal_type === "lunch").length || 0,
    snack: mealData?.filter((m) => m.meal_type === "snack").length || 0,
  };

  // Message stats
  const { count: unreadCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("school_id", profile.school_id)
    .eq("read", false);

  const { count: todayCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("school_id", profile.school_id)
    .gte("created_at", today);

  return {
    attendance: attendanceStats,
    incidents: incidentStats,
    meals: mealStats,
    messages: {
      unread: unreadCount || 0,
      total_today: todayCount || 0,
    },
  };
}

/**
 * Assign teacher to classroom
 */
export async function assignTeacherToClass(teacherId: string, classroomId: number) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  // Verify teacher belongs to school
  const { data: teacher } = await supabase
    .from("users")
    .select("id")
    .eq("id", teacherId)
    .eq("school_id", profile.school_id)
    .eq("role", "TEACHER")
    .single();

  if (!teacher) {
    throw new Error("Teacher not found or not in your school");
  }

  // Verify classroom belongs to school
  const { data: classroom } = await supabase
    .from("classrooms")
    .select("id")
    .eq("id", classroomId)
    .eq("school_id", profile.school_id)
    .single();

  if (!classroom) {
    throw new Error("Classroom not found or not in your school");
  }

  // Create assignment
  const { error } = await supabase
    .from("teacher_classroom")
    .insert({
      teacher_id: teacherId,
      classroom_id: classroomId,
    });

  if (error) {
    throw new Error(`Failed to assign teacher: ${error.message}`);
  }
}

/**
 * Remove teacher from classroom
 */
export async function removeTeacherFromClass(teacherId: string, classroomId: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("teacher_classroom")
    .delete()
    .eq("teacher_id", teacherId)
    .eq("classroom_id", classroomId);

  if (error) {
    throw new Error(`Failed to remove teacher: ${error.message}`);
  }
}

/**
 * Link parent to child
 */
export async function linkParentToChild(parentId: string, childId: number) {
  const supabase = await createClient();
  const profile = await getCurrentUserProfile();

  // Verify parent belongs to school
  const { data: parent } = await supabase
    .from("users")
    .select("id")
    .eq("id", parentId)
    .eq("school_id", profile.school_id)
    .eq("role", "PARENT")
    .single();

  if (!parent) {
    throw new Error("Parent not found or not in your school");
  }

  // Verify child belongs to school
  const { data: child } = await supabase
    .from("children")
    .select("id")
    .eq("id", childId)
    .eq("school_id", profile.school_id)
    .single();

  if (!child) {
    throw new Error("Child not found or not in your school");
  }

  // Create link
  const { error } = await supabase
    .from("parent_child")
    .insert({
      parent_id: parentId,
      child_id: childId,
    });

  if (error) {
    throw new Error(`Failed to link parent to child: ${error.message}`);
  }
}

/**
 * Remove parent-child link
 */
export async function unlinkParentFromChild(parentId: string, childId: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("parent_child")
    .delete()
    .eq("parent_id", parentId)
    .eq("child_id", childId);

  if (error) {
    throw new Error(`Failed to unlink parent from child: ${error.message}`);
  }
}
