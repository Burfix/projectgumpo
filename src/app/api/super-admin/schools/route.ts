import { NextRequest, NextResponse } from "next/server";
import { 
  getAllSchools, 
  getSchoolById, 
  createSchool, 
  updateSchool, 
  deleteSchool 
} from "@/lib/db/superAdminDashboard";
import { validateData, SchoolSchemas, CommonSchemas } from "@/lib/validation";
import { logError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("id");

    if (schoolId) {
      const school = await getSchoolById(schoolId);
      return NextResponse.json(school);
    }

    const schools = await getAllSchools();
    return NextResponse.json(schools);
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'GET /api/super-admin/schools' });
    return NextResponse.json(
      { error: error.message || "Failed to fetch schools" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const school = await createSchool(body);
    return NextResponse.json(school, { status: 201 });
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'POST /api/super-admin/schools' });
    return NextResponse.json(
      { error: error.message || "Failed to create school" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolIdStr = searchParams.get("id");

    if (!schoolIdStr) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 }
      );
    }

    const schoolId = parseInt(schoolIdStr);
    if (isNaN(schoolId) || schoolId <= 0) {
      return NextResponse.json(
        { error: "Invalid school ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validationResult = validateData(SchoolSchemas.update, { ...body, schoolId });
    if (!validationResult.success) {
      return validationResult.response;
    }

    const school = await updateSchool(schoolIdStr, validationResult.data);
    return NextResponse.json(school);
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'PATCH /api/super-admin/schools' });
    return NextResponse.json(
      { error: error.message || "Failed to update school" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolIdStr = searchParams.get("id");

    if (!schoolIdStr) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 }
      );
    }

    const schoolId = parseInt(schoolIdStr);
    if (isNaN(schoolId) || schoolId <= 0) {
      return NextResponse.json(
        { error: "Invalid school ID" },
        { status: 400 }
      );
    }

    await deleteSchool(schoolIdStr);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'DELETE /api/super-admin/schools' });
    return NextResponse.json(
      { error: error.message || "Failed to delete school" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}
