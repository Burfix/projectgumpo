import { NextResponse } from "next/server";
import { assignTeacherToClass } from "@/lib/db/secondaryPrincipalDashboard";

export async function POST(request: Request) {
  try {
    const { teacherId, classroomId } = await request.json();

    if (!teacherId || !classroomId) {
      return NextResponse.json(
        { error: "Teacher ID and Classroom ID are required" },
        { status: 400 }
      );
    }

    await assignTeacherToClass(teacherId, classroomId);
    return NextResponse.json({ success: true, message: "Teacher assigned successfully" });
  } catch (error: any) {
    console.error("Error assigning teacher:", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign teacher" },
      { status: 500 }
    );
  }
}
