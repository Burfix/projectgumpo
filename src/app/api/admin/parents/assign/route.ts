import { NextRequest, NextResponse } from "next/server";
import { assignChildToParent } from "@/lib/db/principalDashboard";
import { validateData, ParentSchemas } from "@/lib/validation";
import { logError } from "@/lib/errors";

/**
 * POST /api/admin/parents/assign
 * Assign a child to a parent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Map the incoming data to match ParentSchemas.linkChild
    const dataToValidate = {
      parentId: body.parent_id,
      childId: body.child_id,
      relationship: body.relationship || "parent",
      schoolId: undefined, // Will be set by the service based on auth context
    };

    const validationResult = validateData(ParentSchemas.linkChild, dataToValidate);
    if (!validationResult.success) {
      return validationResult.response;
    }

    // Assign child to parent with additional fields
    await assignChildToParent({
      parent_id: body.parent_id,
      child_id: body.child_id,
      relationship: validationResult.data.relationship,
      is_primary: body.is_primary ?? true,
      can_pickup: body.can_pickup ?? true,
    });

    return NextResponse.json({ 
      message: "Child assigned successfully",
      success: true 
    });
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'POST /api/admin/parents/assign' });
    return NextResponse.json(
      { error: error.message || "Failed to assign child" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
