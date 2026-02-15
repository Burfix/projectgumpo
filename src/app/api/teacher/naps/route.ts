import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { startNap, endNap } from "@/lib/db/teacherDashboard";
import { validateRequest, ActivitySchemas } from "@/lib/validation";
import { logError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("id, school_id")
      .eq("id", user.id)
      .single();

    if (!userData || !userData.school_id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const validationResult = await validateRequest(request, ActivitySchemas.nap);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const { childId, classroomId, start_time, end_time, notes, schoolId } = validationResult.data;

    const result = await startNap(
      childId,
      classroomId,
      userData.school_id,
      userData.id,
      notes
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'POST /api/teacher/naps' });
    return NextResponse.json(
      { error: error.message || "Failed to log nap" },
      { status: 500 }
    );
  }
}
