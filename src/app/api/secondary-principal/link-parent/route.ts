import { NextResponse } from "next/server";
import { linkParentToChild } from "@/lib/db/secondaryPrincipalDashboard";

export async function POST(request: Request) {
  try {
    const { parentId, childId } = await request.json();

    if (!parentId || !childId) {
      return NextResponse.json(
        { error: "Parent ID and Child ID are required" },
        { status: 400 }
      );
    }

    await linkParentToChild(parentId, childId);
    return NextResponse.json({ success: true, message: "Parent linked to child successfully" });
  } catch (error: any) {
    console.error("Error linking parent to child:", error);
    return NextResponse.json(
      { error: error.message || "Failed to link parent to child" },
      { status: 500 }
    );
  }
}
