import { NextRequest, NextResponse } from "next/server";
import { 
  getAllUsers, 
  getUserById, 
  updateUserRole, 
  updateUserStatus,
  assignUserToSchool 
} from "@/lib/db/superAdminDashboard";
import { validateData, SuperAdminSchemas, CommonSchemas } from "@/lib/validation";
import { logError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");
    const role = searchParams.get("role");
    const schoolId = searchParams.get("school_id");
    const status = searchParams.get("status");

    if (userId) {
      // Validate UUID format
      const uuidValidation = CommonSchemas.uuid.safeParse(userId);
      if (!uuidValidation.success) {
        return NextResponse.json(
          { error: "Invalid user ID format" },
          { status: 400 }
        );
      }

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
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'GET /api/super-admin/users' });
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

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, value } = body;

    let result;
    if (action === "update_role") {
      const validationResult = validateData(SuperAdminSchemas.updateUserRole, { userId, action, value });
      if (!validationResult.success) {
        return validationResult.response;
      }
      result = await updateUserRole(userId, value);
    } else if (action === "update_status") {
      const validationResult = validateData(SuperAdminSchemas.updateUserStatus, { userId, action, value });
      if (!validationResult.success) {
        return validationResult.response;
      }
      result = await updateUserStatus(userId, value);
    } else if (action === "assign_school") {
      const validationResult = validateData(SuperAdminSchemas.assignUserToSchool, { userId, action, value });
      if (!validationResult.success) {
        return validationResult.response;
      }
      result = await assignUserToSchool(userId, value);
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'PATCH /api/super-admin/users' });
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}
