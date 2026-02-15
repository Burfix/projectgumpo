import { NextRequest, NextResponse } from "next/server";
import { getTeachers, inviteTeacher, deleteTeacher } from "@/lib/db/principalDashboard";
import { validateRequest, InviteSchemas, CommonSchemas } from "@/lib/validation";
import { logError } from "@/lib/errors";

export async function GET() {
  try {
    const teachers = await getTeachers();
    return NextResponse.json(teachers);
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'GET /api/admin/teachers' });
    return NextResponse.json(
      { error: error.message || "Failed to fetch teachers" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const validationResult = await validateRequest(request, InviteSchemas.teacher);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const { email, name } = validationResult.data;

    const invite = await inviteTeacher(email, name);
    return NextResponse.json(invite, { status: 201 });
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'POST /api/admin/teachers' });
    return NextResponse.json(
      { error: error.message || "Failed to invite teacher" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get("id");

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidValidation = CommonSchemas.uuid.safeParse(teacherId);
    if (!uuidValidation.success) {
      return NextResponse.json(
        { error: "Invalid teacher ID format" },
        { status: 400 }
      );
    }

    await deleteTeacher(teacherId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'DELETE /api/admin/teachers' });
    return NextResponse.json(
      { error: error.message || "Failed to delete teacher" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
