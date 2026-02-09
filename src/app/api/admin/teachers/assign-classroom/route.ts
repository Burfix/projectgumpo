import { NextRequest, NextResponse } from "next/server";
import { assignTeacherToClassroom } from "@/lib/db/principalDashboard";

/**
 * POST /api/admin/teachers/assign-classroom
 * Assign a teacher to a classroom
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teacher_id, classroom_id, is_primary } = body;

    // Validate required fields
    if (!teacher_id || !classroom_id) {
      return NextResponse.json(
        { error: "teacher_id and classroom_id are required" },
        { status: 400 }
      );
    }

    // Assign teacher to classroom
    await assignTeacherToClassroom(teacher_id, classroom_id, is_primary ?? false);

    return NextResponse.json({ 
      message: "Teacher assigned to classroom successfully",
      success: true 
    });
  } catch (error: any) {
    console.error("Error assigning teacher to classroom:", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign teacher" },
      { status: 500 }
    );
  }
}
