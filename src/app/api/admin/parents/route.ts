import { NextRequest, NextResponse } from "next/server";
import { getParents, inviteParent, linkParentToChild, unlinkParentFromChild } from "@/lib/db/principalDashboard";

export async function GET() {
  try {
    const parents = await getParents();
    return NextResponse.json(parents);
  } catch (error: any) {
    console.error("Get parents error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch parents" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, action, parentId, childId, relationship } = body;

    if (action === "link") {
      if (!parentId || !childId) {
        return NextResponse.json(
          { error: "Parent ID and Child ID are required" },
          { status: 400 }
        );
      }
      const result = await linkParentToChild(parentId, childId, relationship);
      return NextResponse.json(result);
    }

    if (action === "unlink") {
      if (!parentId || !childId) {
        return NextResponse.json(
          { error: "Parent ID and Child ID are required" },
          { status: 400 }
        );
      }
      const result = await unlinkParentFromChild(parentId, childId);
      return NextResponse.json(result);
    }

    // Default: invite parent
    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    const invite = await inviteParent(email, name);
    return NextResponse.json(invite, { status: 201 });
  } catch (error: any) {
    console.error("Parent action error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
