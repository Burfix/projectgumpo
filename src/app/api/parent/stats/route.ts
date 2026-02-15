import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getParentChildren, getChildTodaySummary, getUnreadMessageCount } from "@/lib/db/parentDashboard";
import { logError } from "@/lib/errors";

export async function GET() {
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
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, name, role")
      .eq("email", user.email)
      .single();

    console.log("Parent stats - User:", user.email, "Profile:", profile, "Error:", profileError);

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found. Please contact your school administrator.", details: "No profile in users table" },
        { status: 403 }
      );
    }

    // Allow PARENT and SUPER_ADMIN for testing
    if (profile.role !== "PARENT" && profile.role !== "SUPER_ADMIN" && profile.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Not authorized as parent", details: `Your role is: ${profile.role}` },
        { status: 403 }
      );
    }

    // Get parent's children
    const children = await getParentChildren(profile.id);

    // Get today's summary for all children
    const childSummaries = await Promise.all(
      children.map(async (child) => {
        const summary = await getChildTodaySummary(child.id);
        return {
          childId: child.id,
          name: `${child.first_name} ${child.last_name}`,
          summary,
        };
      })
    );

    // Get unread message count
    const unreadMessages = await getUnreadMessageCount(profile.id);

    // Calculate overall stats
    const totalChildren = children.length;
    const presentToday = childSummaries.filter(s => s.summary.has_checked_in && !s.summary.has_checked_out).length;
    const totalMealsToday = childSummaries.reduce((sum, s) => sum + s.summary.meals.length, 0);
    const totalIncidentsToday = childSummaries.reduce((sum, s) => sum + s.summary.incidents.length, 0);
    const totalNapsToday = childSummaries.filter(s => s.summary.naps.length > 0).length;

    return NextResponse.json({
      totalChildren,
      presentToday,
      totalMealsToday,
      totalNapsToday,
      totalIncidentsToday,
      unreadMessages,
      children,
      childSummaries,
    });

  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'GET /api/parent/stats' });
    return NextResponse.json(
      { error: "Failed to fetch parent statistics" },
      { status: 500 }
    );
  }
}
