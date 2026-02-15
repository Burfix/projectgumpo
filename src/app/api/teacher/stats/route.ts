import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTeacherDashboardStats, getTeacherClassrooms } from "@/lib/db/teacherDashboard";
import { logError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("id, school_id")
      .eq("id", user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get teacher's classrooms
    const classrooms = await getTeacherClassrooms(userData.id);
    
    if (classrooms.length === 0) {
      return NextResponse.json({
        hasClassroom: false,
        stats: null,
      });
    }

    const classroom = classrooms[0];
    const stats = await getTeacherDashboardStats(classroom.id);

    return NextResponse.json({
      hasClassroom: true,
      classroom,
      stats,
      allClassrooms: classrooms,
    });
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'GET /api/teacher/stats' });
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
