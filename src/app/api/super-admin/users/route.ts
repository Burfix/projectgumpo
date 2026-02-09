import { NextRequest, NextResponse } from "next/server";
import { 
  getAllUsers, 
  getUserById, 
  updateUserRole, 
  updateUserStatus,
  assignUserToSchool 
} from "@/lib/db/superAdminDashboard";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");
    const role = searchParams.get("role");
    const schoolId = searchParams.get("school_id");
    const status = searchParams.get("status");

    if (userId) {
      const user = await getUserById(userId);
      return NextResponse.json(user);
    }

    const users = await getAllUsers({ 
      role: role || undefined, 
      school_id: schoolId || undefined,
      status: status || undefined 
    });
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");
    const body = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { action, value } = body;

    let result;
    if (action === "update_role") {
      result = await updateUserRole(userId, value);
    } else if (action === "update_status") {
      result = await updateUserStatus(userId, value);
    } else if (action === "assign_school") {
      result = await assignUserToSchool(userId, value);
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}
