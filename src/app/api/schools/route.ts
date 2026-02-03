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
    const { name, city, type } = body;

    if (!name || !city || !type) {
      return NextResponse.json(
        { message: "All fields (name, city, type) are required." },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();
    const insertPayload = {
      name: name.trim(),
      city: city.trim(),
      type: type.trim(),
    };

    const { data, error } = await supabase
      .from("schools")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { message: error.message, details: error.details, hint: error.hint },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { message: "School created but no data returned" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/schools:", error);
    return NextResponse.json(
      { error: (error as any)?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
