import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { startNap, endNap } from "@/lib/db/teacherDashboard";

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
    const { action, child_id, classroom_id, nap_id, quality, notes } = body;

    if (action === "start") {
      if (!child_id || !classroom_id) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      const result = await startNap(
        child_id,
        classroom_id,
        userData.school_id,
        userData.id,
        notes
      );

      return NextResponse.json(result, { status: 201 });
    }

    if (action === "end") {
      if (!nap_id) {
        return NextResponse.json(
          { error: "Nap ID is required" },
          { status: 400 }
        );
      }

      const result = await endNap(nap_id, quality);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Nap log error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log nap" },
      { status: 500 }
    );
  }
}
