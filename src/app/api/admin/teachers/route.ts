import { NextRequest, NextResponse } from "next/server";
import { getTeachers, inviteTeacher, deleteTeacher } from "@/lib/db/principalDashboard";

export async function GET() {
  try {
    const teachers = await getTeachers();
    return NextResponse.json(teachers);
  } catch (error: any) {
    console.error("Get teachers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch teachers" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    const invite = await inviteTeacher(email, name);
    return NextResponse.json(invite, { status: 201 });
  } catch (error: any) {
    console.error("Invite teacher error:", error);
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

    await deleteTeacher(teacherId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete teacher error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete teacher" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
