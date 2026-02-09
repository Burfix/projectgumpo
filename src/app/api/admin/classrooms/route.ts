import { NextRequest, NextResponse } from "next/server";
import { 
  getClassrooms, 
  addClassroom, 
  updateClassroom, 
  deleteClassroom,
  assignTeacherToClassroom,
  removeTeacherFromClassroom
} from "@/lib/db/principalDashboard";

export async function GET() {
  try {
    const classrooms = await getClassrooms();
    return NextResponse.json(classrooms);
  } catch (error: any) {
    console.error("Get classrooms error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch classrooms" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, teacherId, classroomId, isPrimary, ...classroomData } = body;

    if (action === "assign-teacher") {
      if (!teacherId || !classroomId) {
        return NextResponse.json(
          { error: "Teacher ID and Classroom ID are required" },
          { status: 400 }
        );
      }
      const result = await assignTeacherToClassroom(teacherId, classroomId, isPrimary);
      return NextResponse.json(result);
    }

    if (action === "remove-teacher") {
      if (!teacherId || !classroomId) {
        return NextResponse.json(
          { error: "Teacher ID and Classroom ID are required" },
          { status: 400 }
        );
      }
      const result = await removeTeacherFromClassroom(teacherId, classroomId);
      return NextResponse.json(result);
    }

    // Default: create classroom
    const classroom = await addClassroom(classroomData);
    return NextResponse.json(classroom, { status: 201 });
  } catch (error: any) {
    console.error("Classroom action error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("id");
    const body = await request.json();

    if (!classroomId) {
      return NextResponse.json(
        { error: "Classroom ID is required" },
        { status: 400 }
      );
    }

    const classroom = await updateClassroom(parseInt(classroomId), body);
    return NextResponse.json(classroom);
  } catch (error: any) {
    console.error("Update classroom error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update classroom" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("id");

    if (!classroomId) {
      return NextResponse.json(
        { error: "Classroom ID is required" },
        { status: 400 }
      );
    }

    await deleteClassroom(parseInt(classroomId));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete classroom error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete classroom" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
