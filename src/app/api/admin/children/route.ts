import { NextRequest, NextResponse } from "next/server";
import { getChildren, addChild, updateChild, deleteChild } from "@/lib/db/principalDashboard";
import { validateRequest, ChildSchemas } from "@/lib/validation";
import { logError } from "@/lib/errors";

export async function GET() {
  try {
    const children = await getChildren();
    return NextResponse.json(children);
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'GET /api/admin/children' });
    return NextResponse.json(
      { error: error.message || "Failed to fetch children" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const validationResult = await validateRequest(request, ChildSchemas.create);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const child = await addChild(validationResult.data);
    return NextResponse.json(child, { status: 201 });
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'POST /api/admin/children' });
    return NextResponse.json(
      { error: error.message || "Failed to add child" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("id");

    if (!childId || isNaN(parseInt(childId))) {
      return NextResponse.json(
        { error: "Valid Child ID is required" },
        { status: 400 }
      );
    }

    const validationResult = await validateRequest(request, ChildSchemas.update);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const child = await updateChild(parseInt(childId), validationResult.data);
    return NextResponse.json(child);
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'PATCH /api/admin/children' });
    return NextResponse.json(
      { error: error.message || "Failed to update child" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("id");

    if (!childId) {
      return NextResponse.json(
        { error: "Child ID is required" },
        { status: 400 }
      );
    }

    await deleteChild(parseInt(childId));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete child error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete child" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
