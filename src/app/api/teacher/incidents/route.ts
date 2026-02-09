import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reportIncident } from "@/lib/db/teacherDashboard";

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

    const body = await request.json();
    const { child_id, classroom_id, incident_type, severity, description, action_taken } = body;

    if (!child_id || !classroom_id || !incident_type || !severity || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await reportIncident(
      child_id,
      classroom_id,
      userData.school_id,
      userData.id,
      incident_type,
      severity,
      description,
      action_taken
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Report incident error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to report incident" },
      { status: 500 }
    );
  }
}
