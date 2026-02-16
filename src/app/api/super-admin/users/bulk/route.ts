import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/errors";

/**
 * POST /api/super-admin/users/bulk
 * Bulk actions on users (activate, deactivate, change role)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userIds } = body;

    if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. action and userIds array required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    switch (action) {
      case "activate":
        const { error: activateError } = await supabase
          .from("users")
          .update({ is_active: true })
          .in("id", userIds);

        if (activateError) throw activateError;
        break;

      case "deactivate":
        const { error: deactivateError } = await supabase
          .from("users")
          .update({ is_active: false })
          .in("id", userIds);

        if (deactivateError) throw deactivateError;
        break;

      case "delete":
        // Soft delete by setting is_active to false
        const { error: deleteError } = await supabase
          .from("users")
          .update({ is_active: false })
          .in("id", userIds);

        if (deleteError) throw deleteError;
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${action} applied to ${userIds.length} users`,
    });
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "POST /api/super-admin/users/bulk" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}
