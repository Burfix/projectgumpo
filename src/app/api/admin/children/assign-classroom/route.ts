import { NextRequest, NextResponse } from "next/server";
import { updateChild } from "@/lib/db/principalDashboard";

/**
 * POST /api/admin/children/assign-classroom
 * Assign a child to a classroom
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { child_id, classroom_id } = body;

    // Validate required fields
    if (!child_id || !classroom_id) {
      return NextResponse.json(
        { error: "child_id and classroom_id are required" },
        { status: 400 }
      );
    }

    // Update child's classroom
    await updateChild(child_id, { classroom_id });

    return NextResponse.json({ 
      message: "Classroom assigned successfully",
      success: true 
    });
  } catch (error: any) {
    console.error("Error assigning classroom to child:", error);
    return NextResponse.json(
      { error: error.message || "Failed to assign classroom" },
      { status: 500 }
    );
  }
}
