import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Revalidate cache every 60 seconds
export const revalidate = 60;

export async function GET() {
  try {
    const supabase = await createAdminClient();

    // Fetch schools directly
    const { data: schools, error: schoolsError } = await supabase
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });

    if (schoolsError) {
      console.error("Error fetching schools:", schoolsError);
      return NextResponse.json({ error: "Failed to fetch schools" }, { status: 500 });
    }

    // For each school, fetch the counts
    const schoolsWithStats = await Promise.all(
      (schools || []).map(async (school: any) => {
        // Count children
        const { count: childrenCount } = await supabase
          .from("children")
          .select("*", { count: "exact", head: true })
          .eq("school_id", school.id);

        // Count users by role
        const { data: users } = await supabase
          .from("users")
          .select("role")
          .eq("school_id", school.id);

        const parentsCount = (users || []).filter((u: any) => u.role === "PARENT").length;
        const teachersCount = (users || []).filter((u: any) => u.role === "TEACHER").length;
        const adminsCount = (users || []).filter((u: any) => u.role === "ADMIN").length;

        return {
          id: school.id,
          name: school.name,
          location: school.location,
          school_type: school.school_type,
          status: school.account_status,
          subscription_tier: school.subscription_tier,
          children_count: childrenCount || 0,
          parents_count: parentsCount,
          teachers_count: teachersCount,
          admins_count: adminsCount,
          created_at: school.created_at,
        };
      })
    );

    return NextResponse.json(schoolsWithStats);
  } catch (error) {
    console.error("Error fetching schools with stats:", error);
    return NextResponse.json({ error: "Failed to fetch schools" }, { status: 500 });
  }
}
