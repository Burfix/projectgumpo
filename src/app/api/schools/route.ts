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
    try {
      await protectApiRoute(["SUPER_ADMIN"]);
    } catch (authError) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        { error: "Unauthorized - only super admins can create schools" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, location, subscription_tier, account_status } = body;

    if (!name) {
      return NextResponse.json(
        { error: "School name is required" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // Insert only the essential fields - let database defaults handle the rest
    // This bypasses schema cache issues by not explicitly setting account_status
    const insertPayload: any = {
      name: name.trim(),
    };

    if (location) {
      insertPayload.location = location.trim();
    }

    if (subscription_tier) {
      insertPayload.subscription_tier = subscription_tier;
    }

    // Only add account_status if explicitly provided and non-null
    if (account_status) {
      insertPayload.account_status = account_status;
    }

    console.log("Inserting school with payload:", insertPayload);

    const { data, error } = await supabase
      .from("schools")
      .insert(insertPayload)
      .select("id, name, location, subscription_tier");

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create school" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "School created but no data returned" },
        { status: 500 }
      );
    }

    // Return the created school with defaults applied
    return NextResponse.json({
      ...data[0],
      account_status: account_status || "Trial",
      children_count: 0,
      parents_count: 0,
      teachers_count: 0,
      admins_count: 0,
    }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/schools:", error);
    return NextResponse.json(
      { error: (error as any)?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
