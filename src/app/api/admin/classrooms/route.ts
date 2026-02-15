import { NextRequest, NextResponse } from "next/server";
import { 
  getClassrooms, 
  addClassroom, 
  updateClassroom, 
  deleteClassroom,
  assignTeacherToClassroom,
  removeTeacherFromClassroom
} from "@/lib/db/principalDashboard";
import { validateData, ClassroomSchemas, CommonSchemas } from "@/lib/validation";
import { logError } from "@/lib/errors";

export async function GET() {
  try {
    const classrooms = await getClassrooms();
    return NextResponse.json(classrooms);
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'GET /api/admin/classrooms' });
    return NextResponse.json(
      { error: error.message || "Failed to fetch classrooms" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "assign-teacher") {
      const validationResult = validateData(ClassroomSchemas.assignTeacher, body);
      if (!validationResult.success) {
        return validationResult.response;
      }

      const { teacherId, classroomId, isPrimary } = validationResult.data;
      const result = await assignTeacherToClassroom(teacherId, classroomId, isPrimary);
      return NextResponse.json(result);
    }

    if (action === "remove-teacher") {
      const validationResult = validateData(ClassroomSchemas.removeTeacher, body);
      if (!validationResult.success) {
        return validationResult.response;
      }

      const { teacherId, classroomId } = validationResult.data;
      const result = await removeTeacherFromClassroom(teacherId, classroomId);
      return NextResponse.json(result);
    }

    // Default: create classroom
    const validationResult = validateData(ClassroomSchemas.create, body);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const classroom = await addClassroom(validationResult.data);
    return NextResponse.json(classroom, { status: 201 });
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'POST /api/admin/classrooms' });
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomIdStr = searchParams.get("id");

    if (!classroomIdStr) {
      return NextResponse.json(
        { error: "Classroom ID is required" },
        { status: 400 }
      );
    }

    const classroomId = parseInt(classroomIdStr);
    if (isNaN(classroomId) || classroomId <= 0) {
      return NextResponse.json(
        { error: "Invalid classroom ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validationResult = validateData(ClassroomSchemas.update, body);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const classroom = await updateClassroom(classroomId, validationResult.data);
    return NextResponse.json(classroom);
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'PATCH /api/admin/classrooms' });
    return NextResponse.json(
      { error: error.message || "Failed to update classroom" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classroomIdStr = searchParams.get("id");

    if (!classroomIdStr) {
      return NextResponse.json(
        { error: "Classroom ID is required" },
        { status: 400 }
      );
    }

    const classroomId = parseInt(classroomIdStr);
    if (isNaN(classroomId) || classroomId <= 0) {
      return NextResponse.json(
        { error: "Invalid classroom ID" },
        { status: 400 }
      );
    }

    await deleteClassroom(classroomId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'DELETE /api/admin/classrooms' });
    return NextResponse.json(
      { error: error.message || "Failed to delete classroom" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}