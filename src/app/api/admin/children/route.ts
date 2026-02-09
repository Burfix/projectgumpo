import { NextRequest, NextResponse } from "next/server";
import { getChildren, addChild, updateChild, deleteChild } from "@/lib/db/principalDashboard";

export async function GET() {
  try {
    const children = await getChildren();
    return NextResponse.json(children);
  } catch (error: any) {
    console.error("Get children error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch children" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const child = await addChild(body);
    return NextResponse.json(child, { status: 201 });
  } catch (error: any) {
    console.error("Add child error:", error);
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
    const body = await request.json();

    if (!childId) {
      return NextResponse.json(
        { error: "Child ID is required" },
        { status: 400 }
      );
    }

    const child = await updateChild(parseInt(childId), body);
    return NextResponse.json(child);
  } catch (error: any) {
    console.error("Update child error:", error);
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
