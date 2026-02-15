import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getParentChildren, getChildDailyTimeline } from "@/lib/db/parentDashboard";
import { logError } from "@/lib/errors";
import { CommonSchemas } from "@/lib/validation";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", user.email)
      .single();

    if (!profile || profile.role !== "PARENT") {
      return NextResponse.json(
        { error: "Not authorized as parent" },
        { status: 403 }
      );
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");
    const date = searchParams.get("date") || undefined;

    if (!childId) {
      return NextResponse.json(
        { error: "Child ID is required" },
        { status: 400 }
      );
    }

    const childIdNum = parseInt(childId);
    if (isNaN(childIdNum) || childIdNum <= 0) {
      return NextResponse.json(
        { error: "Invalid child ID" },
        { status: 400 }
      );
    }

    // Verify parent has access to this child
    const children = await getParentChildren(profile.id);
    const hasAccess = children.some(c => c.id === childIdNum);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You don't have access to this child's information" },
        { status: 403 }
      );
    }

    // Get child details
    const child = children.find(c => c.id === childIdNum);

    // Get timeline
    const timeline = await getChildDailyTimeline(childIdNum, date);

    return NextResponse.json({
      child,
      timeline,
      date: date || new Date().toISOString().split('T')[0],
    });

  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'GET /api/parent/timeline' });
    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
