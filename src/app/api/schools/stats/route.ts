import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createAdminClient();

    // Get counts for each user role across all schools
    const { data: users, error } = await supabase
      .from("users")
      .select("role");

    if (error) {
      console.error("Error fetching user stats:", error);
      return NextResponse.json(
        { error: "Failed to fetch statistics" },
        { status: 500 }
      );
    }

    // Count by role
    const stats = {
      children: 0,
      parents: users?.filter(u => u.role === "PARENT").length || 0,
      teachers: users?.filter(u => u.role === "TEACHER").length || 0,
      admins: users?.filter(u => u.role === "ADMIN").length || 0,
    };

    // Try to get children count from a children table if it exists
    const { count: childrenCount } = await supabase
      .from("children")
      .select("*", { count: "exact", head: true });

    stats.children = childrenCount || 0;

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error in stats endpoint:", error);
    return NextResponse.json(
      { children: 0, parents: 0, teachers: 0, admins: 0 },
      { status: 200 }
    );
  }
}
