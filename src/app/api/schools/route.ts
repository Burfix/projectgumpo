import { NextResponse } from "next/server";
import { getSchools } from "@/lib/schools";
import { createAdminClient } from "@/lib/supabase/admin";
import { protectApiRoute } from "@/lib/auth/middleware";

export async function GET() {
  try {
    const schools = await getSchools();
    return NextResponse.json(schools);
  } catch (error) {
    console.error("Error fetching schools:", error);
    return NextResponse.json({ error: "Failed to fetch schools" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Verify user is super admin
    await protectApiRoute(["SUPER_ADMIN"]);

    const body = await request.json();
    const { name, location, subscription_tier, account_status } = body;

    if (!name) {
      return NextResponse.json(
        { error: "School name is required" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Create school in database
    const { data, error } = await supabase
      .from("schools")
      .insert([
        {
          name,
          location: location || null,
          subscription_tier: subscription_tier || "Starter",
          account_status: account_status || "Trial",
        },
      ])
      .select();

    if (error) {
      console.error("Error creating school:", error);
      return NextResponse.json(
        { error: "Failed to create school" },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/schools:", error);
    return NextResponse.json(
      { error: "Unauthorized or invalid request" },
      { status: 403 }
    );
  }
}
