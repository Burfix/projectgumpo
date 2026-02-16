import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateData, CommonSchemas } from "@/lib/validation";
import { logError } from "@/lib/errors";

/**
 * GET /api/admin/reports
 * Get various reports for the admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's school
    const { data: userData } = await supabase
      .from("users")
      .select("school_id, role")
      .eq("id", user.id)
      .single();

    if (!userData?.school_id || !['ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'].includes(userData.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const dateRange = searchParams.get("dateRange") || "30";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let fromDate: string;
    let toDate: string = new Date().toISOString().split('T')[0];

    if (dateRange === "custom" && startDate && endDate) {
      fromDate = startDate;
      toDate = endDate;
    } else {
      const daysAgo = parseInt(dateRange);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      fromDate = date.toISOString().split('T')[0];
    }

    if (type === "attendance") {
      // Attendance summary by classroom
      const { data: classrooms } = await supabase
        .from("classrooms")
        .select("id, name")
        .eq("school_id", userData.school_id);

      const attendanceReport = await Promise.all(
        (classrooms || []).map(async (classroom) => {
          // Get all children in this classroom
          const { data: children } = await supabase
            .from("children")
            .select("id")
            .eq("classroom_id", classroom.id);

          const childIds = (children || []).map(c => c.id);
          const totalChildren = childIds.length;

          if (totalChildren === 0) {
            return {
              classroom_name: classroom.name,
              total_children: 0,
              present_count: 0,
              absent_count: 0,
              attendance_percentage: 0,
            };
          }

          // Get attendance records for this date range
          const { data: attendance } = await supabase
            .from("attendance")
            .select("*")
            .in("child_id", childIds)
            .gte("date", fromDate)
            .lte("date", toDate);

          const presentCount = (attendance || []).filter(a => a.status === "present").length;
          const absentCount = (attendance || []).filter(a => a.status === "absent").length;
          const totalRecords = presentCount + absentCount;
          const attendancePercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

          return {
            classroom_name: classroom.name,
            total_children: totalChildren,
            present_count: presentCount,
            absent_count: absentCount,
            attendance_percentage: attendancePercentage,
          };
        })
      );

      return NextResponse.json(attendanceReport);
    }

    if (type === "incidents") {
      // Incident reports
      const { data: incidents } = await supabase
        .from("incidents")
        .select(`
          id,
          incident_type,
          severity,
          description,
          date,
          children (
            first_name,
            last_name,
            classrooms (
              name
            )
          )
        `)
        .eq("school_id", userData.school_id)
        .gte("date", fromDate)
        .lte("date", toDate)
        .order("date", { ascending: false });

      const incidentReport = (incidents || []).map((incident: any) => ({
        id: incident.id,
        child_name: incident.children
          ? `${incident.children.first_name} ${incident.children.last_name}`
          : "Unknown",
        classroom_name: incident.children?.classrooms?.name || "Unknown",
        incident_type: incident.incident_type,
        severity: incident.severity,
        description: incident.description,
        date: incident.date,
      }));

      return NextResponse.json(incidentReport);
    }

    if (type === "engagement") {
      // Parent engagement metrics
      const { data: allParents } = await supabase
        .from("users")
        .select("id, last_sign_in_at")
        .eq("school_id", userData.school_id)
        .eq("role", "PARENT");

      const totalParents = allParents?.length || 0;

      // Active parents (logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeParents = (allParents || []).filter(
        (parent) =>
          parent.last_sign_in_at &&
          new Date(parent.last_sign_in_at) > thirtyDaysAgo
      ).length;

      const engagementRate = totalParents > 0 ? (activeParents / totalParents) * 100 : 0;

      // Calculate average logins per week (simplified - using last sign in as proxy)
      const avgLoginsPerWeek = totalParents > 0 ? (activeParents / totalParents) * 7 : 0;

      return NextResponse.json({
        total_parents: totalParents,
        active_parents: activeParents,
        engagement_rate: engagementRate,
        avg_logins_per_week: avgLoginsPerWeek,
      });
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "GET /api/admin/reports" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to fetch report data" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
