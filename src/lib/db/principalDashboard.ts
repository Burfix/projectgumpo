import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/auth/rbac";

export interface PrincipalDashboardStats {
  totalChildren: number;
  teachers: number;
  parentEngagementPercent: number | null;
  attendancePercent: number | null;
  engagementNote?: string;
  attendanceNote?: string;
}

export interface ClassroomSummary {
  id: number;
  name: string;
  status: string;
  teacherNames: string[];
  childrenCount: number;
}

export interface IncidentSummary {
  id: number;
  childName: string;
  title: string;
  status: "Reviewed" | "Pending";
  createdAt: string;
}

export interface PrincipalDashboardData {
  schoolId: string;
  stats: PrincipalDashboardStats;
  classrooms: ClassroomSummary[];
  incidents: IncidentSummary[];
}

const MISSING_TABLE_CODES = new Set(["42P01", "42703"]);

function isMissingTableError(error?: { code?: string; message?: string }) {
  if (!error) return false;
  if (error.code && MISSING_TABLE_CODES.has(error.code)) return true;
  return Boolean(error.message && error.message.toLowerCase().includes("does not exist"));
}

export async function getPrincipalDashboardData(options?: {
  schoolIdParam?: string | string[];
}): Promise<PrincipalDashboardData> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    throw new Error("Unauthorized: " + (authError?.message || "No auth user"));
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, role, school_id")
    .eq("id", authUser.id)
    .single();

  if (profileError) {
    console.error("Profile query error:", profileError);
    if (profileError.code === '42P01' || profileError.message?.includes('does not exist')) {
      throw new Error("Database tables not found. Please run the COMPLETE_RESET.sql migration first.");
    }
    throw new Error("User profile not found: " + profileError.message);
  }

  if (!profile) {
    throw new Error("User profile not found. Please ensure your account is properly set up in the users table.");
  }

  const role = profile.role as UserRole;
  const schoolIdParam = Array.isArray(options?.schoolIdParam)
    ? options?.schoolIdParam[0]
    : options?.schoolIdParam;
  const resolvedSchoolId =
    role === "SUPER_ADMIN"
      ? schoolIdParam
        ? schoolIdParam
        : profile.school_id
      : profile.school_id;

  if (!resolvedSchoolId) {
    throw new Error("No school assigned to your account. Please contact your administrator or run the seed data script.");
  }

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const totalChildrenQuery = supabase
    .from("children")
    .select("id", { count: "exact", head: true })
    .eq("school_id", resolvedSchoolId);

  const teachersQuery = supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("school_id", resolvedSchoolId)
    .eq("role", "TEACHER");

  const totalParentsQuery = supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("school_id", resolvedSchoolId)
    .eq("role", "PARENT");

  const classroomsQuery = supabase
    .from("classrooms")
    .select("id, name, status")
    .eq("school_id", resolvedSchoolId)
    .order("name");

  const childrenByClassroomQuery = supabase
    .from("children")
    .select("id, classroom_id")
    .eq("school_id", resolvedSchoolId);

  const teacherAssignmentsQuery = supabase
    .from("teacher_classroom")
    .select("classroom_id, teacher:teacher_id (name, email)")
    .eq("school_id", resolvedSchoolId);

  const incidentsQuery = supabase
    .from("incident_reports")
    .select("id, incident_type, description, severity, created_at, child:child_id (first_name, last_name)")
    .eq("school_id", resolvedSchoolId)
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: false })
    .limit(5);

  const attendanceQuery = supabase
    .from("attendance_logs")
    .select("id, status", { count: "exact" })
    .eq("school_id", resolvedSchoolId)
    .eq("date", today)
    .eq("status", "PRESENT");

  const [
    totalChildrenResult,
    teachersResult,
    totalParentsResult,
    classroomsResult,
    childrenByClassroomResult,
    teacherAssignmentsResult,
    incidentsResult,
    attendanceResult,
  ] = await Promise.all([
    totalChildrenQuery,
    teachersQuery,
    totalParentsQuery,
    classroomsQuery,
    childrenByClassroomQuery,
    teacherAssignmentsQuery,
    incidentsQuery,
    attendanceQuery,
  ]);

  // Log errors for debugging
  if (totalChildrenResult.error) {
    console.error("totalChildren error:", totalChildrenResult.error);
  }
  if (classroomsResult.error) {
    console.error("classrooms error:", classroomsResult.error);
  }
  if (childrenByClassroomResult.error) {
    console.error("childrenByClassroom error:", childrenByClassroomResult.error);
  }
  if (teacherAssignmentsResult.error) {
    console.error("teacherAssignments error:", teacherAssignmentsResult.error);
  }
  if (incidentsResult.error) {
    console.error("incidents error:", incidentsResult.error);
  }

  const totalChildren = totalChildrenResult.count ?? 0;
  const teachers = teachersResult.count ?? 0;
  const totalParents = totalParentsResult.count ?? 0;

  let attendancePercent: number | null = null;
  let attendanceNote: string | undefined;
  if (attendanceResult.error && isMissingTableError(attendanceResult.error)) {
    attendanceNote = "Enable attendance tracking to see this";
  } else if (attendanceResult.error) {
    throw new Error(attendanceResult.error.message);
  } else if (totalChildren > 0) {
    const presentToday = attendanceResult.count ?? 0;
    attendancePercent = Math.round((presentToday / totalChildren) * 100);
  } else {
    attendancePercent = 0;
  }

  let parentEngagementPercent: number | null = null;
  let engagementNote: string | undefined;
  // Parent engagement tracking not yet implemented
  engagementNote = "Enable analytics to track";

  const classroomsData = classroomsResult.error
    ? isMissingTableError(classroomsResult.error)
      ? []
      : (() => {
          throw new Error(classroomsResult.error.message);
        })()
    : classroomsResult.data ?? [];

  const childrenByClassroomData = childrenByClassroomResult.error
    ? isMissingTableError(childrenByClassroomResult.error)
      ? []
      : (() => {
          throw new Error(childrenByClassroomResult.error.message);
        })()
    : childrenByClassroomResult.data ?? [];

  const teacherAssignmentsData = teacherAssignmentsResult.error
    ? isMissingTableError(teacherAssignmentsResult.error)
      ? []
      : (() => {
          throw new Error(teacherAssignmentsResult.error.message);
        })()
    : teacherAssignmentsResult.data ?? [];

  const classroomChildrenMap = new Map<number, number>();
  childrenByClassroomData.forEach((child: { classroom_id?: number | null }) => {
    if (!child.classroom_id) return;
    classroomChildrenMap.set(
      child.classroom_id,
      (classroomChildrenMap.get(child.classroom_id) ?? 0) + 1
    );
  });

  const classroomTeachersMap = new Map<number, string[]>();
  teacherAssignmentsData.forEach(
    (assignment: {
      classroom_id?: number | null;
      teacher?: { name?: string | null; email?: string | null } | { name?: string | null; email?: string | null }[] | null;
    }) => {
      if (!assignment.classroom_id) return;
      const teachers = Array.isArray(assignment.teacher)
        ? assignment.teacher
        : assignment.teacher
          ? [assignment.teacher]
          : [];
      const list = classroomTeachersMap.get(assignment.classroom_id) ?? [];
      teachers.forEach((teacher) => {
        const teacherName = teacher?.name || teacher?.email || "Teacher";
        list.push(teacherName);
      });
      classroomTeachersMap.set(assignment.classroom_id, list);
    }
  );

  const classrooms: ClassroomSummary[] = classroomsData.map(
    (room: { id: number; name: string; status?: string | null }) => ({
      id: room.id,
      name: room.name,
      status: room.status || "Active",
      teacherNames: classroomTeachersMap.get(room.id) ?? [],
      childrenCount: classroomChildrenMap.get(room.id) ?? 0,
    })
  );

  const incidentsData = incidentsResult.error
    ? isMissingTableError(incidentsResult.error)
      ? []
      : (() => {
          throw new Error(incidentsResult.error.message);
        })()
    : incidentsResult.data ?? [];

  const incidents: IncidentSummary[] = incidentsData.map(
    (incident: {
      id: number;
      incident_type?: string | null;
      description?: string | null;
      severity?: string | null;
      created_at: string;
      child?:
        | { first_name?: string | null; last_name?: string | null }
        | { first_name?: string | null; last_name?: string | null }[]
        | null;
    }) => {
      const childRecord = Array.isArray(incident.child) ? incident.child[0] : incident.child;
      const childName =
        [childRecord?.first_name, childRecord?.last_name].filter(Boolean).join(" ") ||
        "Unknown Child";
      // All incidents are pending by default since we don't have reviewed_at field yet
      const status = "Pending";
      return {
        id: incident.id,
        childName,
        title: incident.incident_type || "Incident",
        status,
        createdAt: incident.created_at,
      };
    }
  );

  return {
    schoolId: resolvedSchoolId,
    stats: {
      totalChildren,
      teachers,
      parentEngagementPercent,
      attendancePercent,
      engagementNote,
      attendanceNote,
    },
    classrooms,
    incidents,
  };
}
