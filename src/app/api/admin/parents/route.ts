import { NextRequest, NextResponse } from "next/server";
import { getParents, inviteParent, linkParentToChild, unlinkParentFromChild } from "@/lib/db/principalDashboard";
import { validateData, InviteSchemas, ParentSchemas } from "@/lib/validation";
import { logError } from "@/lib/errors";

export async function GET() {
  try {
    const parents = await getParents();
    return NextResponse.json(parents);
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'GET /api/admin/parents' });
    return NextResponse.json(
      { error: error.message || "Failed to fetch parents" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "link") {
      const validationResult = validateData(ParentSchemas.linkChild, body);
      if (!validationResult.success) {
        return validationResult.response;
      }
      const { parentId, childId, relationship } = validationResult.data;
      const result = await linkParentToChild(parentId, childId, relationship);
      return NextResponse.json(result);
    }

    if (action === "unlink") {
      const validationResult = validateData(ParentSchemas.unlinkChild, body);
      if (!validationResult.success) {
        return validationResult.response;
      }
      const { parentId, childId } = validationResult.data;
      const result = await unlinkParentFromChild(parentId, childId);
      return NextResponse.json(result);
    }

    // Default: invite parent
    const validationResult = validateData(InviteSchemas.parent, body);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const { email, name } = validationResult.data;
    const invite = await inviteParent(email, name);
    return NextResponse.json(invite, { status: 201 });
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'POST /api/admin/parents' });
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
