import { NextRequest, NextResponse } from "next/server";
import { 
  getAllSchools, 
  getSchoolById, 
  createSchool, 
  updateSchool, 
  deleteSchool 
} from "@/lib/db/superAdminDashboard";

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
    console.error("Get schools error:", error);
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
    console.error("Create school error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create school" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("id");
    const body = await request.json();

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 }
      );
    }

    const school = await updateSchool(schoolId, body);
    return NextResponse.json(school);
  } catch (error: any) {
    console.error("Update school error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update school" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("id");

    if (!schoolId) {
      return NextResponse.json(
        { error: "School ID is required" },
        { status: 400 }
      );
    }

    await deleteSchool(schoolId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete school error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete school" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}
