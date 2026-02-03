import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createAdminClient();

    // Count total schools
    const { count: totalSchools } = await supabase
      .from("schools")
      .select("*", { count: "exact", head: true });

    // Count active users (users linked to schools)
    const { count: activeUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .not("school_id", "is", null);

    return NextResponse.json({
      total_schools: totalSchools || 0,
      active_users: activeUsers || 0,
    });
  } catch (error) {
    console.error("Error fetching system counters:", error);
    return NextResponse.json(
      { error: "Failed to fetch system counters" },
      { status: 500 }
    );
  }
}
