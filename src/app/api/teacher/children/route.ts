import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTeacherClassrooms, getClassroomChildren } from "@/lib/db/teacherDashboard";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroom_id");

    if (classroomId) {
      const children = await getClassroomChildren(parseInt(classroomId));
      return NextResponse.json(children);
    }

    // Get first classroom's children
    const classrooms = await getTeacherClassrooms(userData.id);
    if (classrooms.length === 0) {
      return NextResponse.json([]);
    }

    const children = await getClassroomChildren(classrooms[0].id);
    return NextResponse.json(children);
  } catch (error: any) {
    console.error("Get children error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch children" },
      { status: 500 }
    );
  }
}
