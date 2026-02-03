import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/schools/[schoolId]/users
 * Fetch all users for a school (SUPER_ADMIN only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const supabase = await createClient();

    // Verify user is SUPER_ADMIN
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role from users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", authUser.id)
      .single();

    if (userError || userData?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all users for the school
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, name, email, phone, role, school_id, created_at")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false });

    if (usersError) {
      throw usersError;
    }

    return NextResponse.json(users || []);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
