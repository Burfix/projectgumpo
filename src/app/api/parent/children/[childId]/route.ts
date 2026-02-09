import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { 
  getParentChildren,
  getChildAttendanceHistory,
  getChildRecentMeals,
  getChildRecentNaps,
  getChildIncidents 
} from "@/lib/db/parentDashboard";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", user.email)
      .single();

    if (!profile || profile.role !== "PARENT") {
      return NextResponse.json(
        { error: "Not authorized as parent" },
        { status: 403 }
      );
    }

    const { childId } = await params;
    const childIdNum = parseInt(childId);

    // Verify parent has access to this child
    const children = await getParentChildren(profile.id);
    const hasAccess = children.some(c => c.id === childIdNum);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this child's information" },
        { status: 403 }
      );
    }

    // Get child details
    const child = children.find(c => c.id === childIdNum);

    // Get classroom info
    let classroom = null;
    if (child?.classroom_id) {
      const { data } = await supabase
        .from("classrooms")
        .select("id, name, age_group")
        .eq("id", child.classroom_id)
        .single();
      classroom = data;
    }

    // Get child's data in parallel
    const [attendance, meals, naps, incidents] = await Promise.all([
      getChildAttendanceHistory(childIdNum),
      getChildRecentMeals(childIdNum),
      getChildRecentNaps(childIdNum),
      getChildIncidents(childIdNum),
    ]);

    return NextResponse.json({
      child,
      classroom,
      attendance,
      meals,
      naps,
      incidents,
    });

  } catch (error) {
    console.error("Error fetching child details:", error);
    return NextResponse.json(
      { error: "Failed to fetch child details" },
      { status: 500 }
    );
  }
}
