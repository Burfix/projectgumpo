import { NextRequest, NextResponse } from "next/server";
import { assignChildToParent } from "@/lib/db/principalDashboard";

/**
 * POST /api/admin/parents/assign
 * Assign a child to a parent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { parent_id, child_id, relationship, is_primary, can_pickup } = body;

    // Validate required fields
    if (!parent_id || !child_id) {
      return NextResponse.json(
        { error: "parent_id and child_id are required" },
        { status: 400 }
      );
    }

    // Assign child to parent
    await assignChildToParent({
      parent_id,
      child_id,
      relationship: relationship || "parent",
      is_primary: is_primary ?? true,
      can_pickup: can_pickup ?? true,
    });

    return NextResponse.json({ 
      message: "Child assigned successfully",
      success: true 
    });
  } catch (error: any) {
    console.error("Error assigning child to parent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign child" },
      { status: 500 }
    );
  }
}
