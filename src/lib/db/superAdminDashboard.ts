import { createClient } from "@/lib/supabase/server";

/**
 * Database helpers for Super Admin Dashboard
 * Super admin has system-wide access across all schools
 */

// ============================================================
// HELPER: Get authenticated super admin
// ============================================================
async function getAuthenticatedSuperAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    throw new Error("User not found");
  }

  if (userData.role !== 'SUPER_ADMIN') {
    throw new Error("Super admin access required");
  }

  return { user: userData, supabase };
}

// ============================================================
// SYSTEM STATISTICS
// ============================================================
export async function getSystemStats() {
  const { supabase } = await getAuthenticatedSuperAdmin();

  // Get counts for all entities across the system
  const [
    { count: schoolsCount },
    { count: usersCount },
    { count: childrenCount },
    { count: teachersCount },
    { count: parentsCount },
    { count: adminsCount },
    { count: classroomsCount },
  ] = await Promise.all([
    supabase.from("schools").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("children").select("*", { count: "exact", head: true }),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "TEACHER"),
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "PARENT"),
    supabase.from("users").select("*", { count: "exact", head: true }).in("role", ["ADMIN", "PRINCIPAL"]),
    supabase.from("classrooms").select("*", { count: "exact", head: true }),
  ]);

  return {
    schools: schoolsCount || 0,
    users: usersCount || 0,
    children: childrenCount || 0,
    teachers: teachersCount || 0,
    parents: parentsCount || 0,
    admins: adminsCount || 0,
    classrooms: classroomsCount || 0,
  };
}

// ============================================================
// SCHOOLS MANAGEMENT
// ============================================================
export async function getAllSchools() {
  const { supabase } = await getAuthenticatedSuperAdmin();

  const { data, error } = await supabase
    .from("schools")
    .select(`
      *,
      users!users_school_id_fkey (id),
      children (id),
      classrooms (id)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Transform data to include counts
  const schools = data?.map((school: any) => ({
    ...school,
    user_count: school.users?.length || 0,
    children_count: school.children?.length || 0,
    classrooms_count: school.classrooms?.length || 0,
  })) || [];

  return schools;
}

export async function getSchoolById(schoolId: string) {
  const { supabase } = await getAuthenticatedSuperAdmin();

  const { data, error } = await supabase
    .from("schools")
    .select(`
      *,
      users!users_school_id_fkey (*),
      children (*),
      classrooms (*)
    `)
    .eq("id", schoolId)
    .single();

  if (error) throw error;
  return data;
}

export async function createSchool(schoolData: {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  school_type?: string;
  max_children?: number;
}) {
  const { supabase } = await getAuthenticatedSuperAdmin();

  const { data, error } = await supabase
    .from("schools")
    .insert({
      ...schoolData,
      status: "trial",
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSchool(schoolId: string, updates: Record<string, any>) {
  const { supabase } = await getAuthenticatedSuperAdmin();

  const { data, error } = await supabase
    .from("schools")
    .update(updates)
    .eq("id", schoolId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSchool(schoolId: string) {
  const { supabase } = await getAuthenticatedSuperAdmin();

  // This will cascade delete related data
  const { error } = await supabase
    .from("schools")
    .delete()
    .eq("id", schoolId);

  if (error) throw error;
  return { success: true };
}

// ============================================================
// USERS MANAGEMENT (System-wide)
// ============================================================
export async function getAllUsers(filters?: {
  role?: string;
  school_id?: string;
  status?: string;
}) {
  const { supabase } = await getAuthenticatedSuperAdmin();

  let query = supabase
    .from("users")
    .select(`
      *,
      schools (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (filters?.role) {
    query = query.eq("role", filters.role);
  }
  if (filters?.school_id) {
    query = query.eq("school_id", filters.school_id);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getUserById(userId: string) {
  const { supabase } = await getAuthenticatedSuperAdmin();

  const { data, error } = await supabase
    .from("users")
    .select(`
      *,
      schools (*)
    `)
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserRole(userId: string, role: string) {
  const { supabase } = await getAuthenticatedSuperAdmin();

  const { data, error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserStatus(userId: string, status: string) {
  const { supabase } = await getAuthenticatedSuperAdmin();

  const { data, error } = await supabase
    .from("users")
    .update({ status })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function assignUserToSchool(userId: string, schoolId: string) {
  const { supabase } = await getAuthenticatedSuperAdmin();

  const { data, error } = await supabase
    .from("users")
    .update({ school_id: schoolId })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================
// AUDIT LOGS
// ============================================================
export async function getAuditLogs(filters?: {
  school_id?: string;
  user_id?: string;
  action?: string;
  limit?: number;
}) {
  const { supabase } = await getAuthenticatedSuperAdmin();

  let query = supabase
    .from("audit_logs")
    .select(`
      *,
      users (
        id,
        name,
        email
      ),
      schools (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false })
    .limit(filters?.limit || 100);

  if (filters?.school_id) {
    query = query.eq("school_id", filters.school_id);
  }
  if (filters?.user_id) {
    query = query.eq("user_id", filters.user_id);
  }
  if (filters?.action) {
    query = query.eq("action", filters.action);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

// ============================================================
// SUBSCRIPTIONS & BILLING
// ============================================================
export async function getAllSubscriptions() {
  const { supabase } = await getAuthenticatedSuperAdmin();

  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      schools (
        id,
        name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getInvoices(filters?: {
  school_id?: string;
  status?: string;
}) {
  const { supabase } = await getAuthenticatedSuperAdmin();

  let query = supabase
    .from("invoices")
    .select(`
      *,
      schools (
        id,
        name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (filters?.school_id) {
    query = query.eq("school_id", filters.school_id);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

// ============================================================
// ANALYTICS & REPORTS
// ============================================================
export async function getGrowthMetrics() {
  const { supabase } = await getAuthenticatedSuperAdmin();

  // Get data from the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: newSchools },
    { count: newUsers },
    { count: newChildren },
  ] = await Promise.all([
    supabase.from("schools").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabase.from("children").select("*", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
  ]);

  return {
    newSchools: newSchools || 0,
    newUsers: newUsers || 0,
    newChildren: newChildren || 0,
    period: "Last 30 days",
  };
}

export async function getSchoolStatuses() {
  const { supabase } = await getAuthenticatedSuperAdmin();

  const { data, error } = await supabase
    .from("schools")
    .select("status");

  if (error) throw error;

  const statusCounts = (data || []).reduce((acc: any, school: any) => {
    acc[school.status] = (acc[school.status] || 0) + 1;
    return acc;
  }, {});

  return statusCounts;
}

// ============================================================
// INVITES MANAGEMENT
// ============================================================
export async function getAllInvites() {
  const { supabase } = await getAuthenticatedSuperAdmin();

  const { data, error } = await supabase
    .from("invites")
    .select(`
      *,
      schools (
        id,
        name
      ),
      users!invites_invited_by_fkey (
        id,
        name,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}
