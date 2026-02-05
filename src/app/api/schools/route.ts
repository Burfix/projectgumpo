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
  console.log("🟢 [API] POST /api/schools - Request received");
  
  try {
    // Verify user is super admin
    console.log("🟢 [API] Checking authentication...");
    try {
      await protectApiRoute(["SUPER_ADMIN"]);
      console.log("✅ [API] Authentication successful - user is SUPER_ADMIN");
    } catch (authError) {
      console.error("🔴 [API] Auth error:", authError);
      return NextResponse.json(
        { error: "Unauthorized - only super admins can create schools" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("🟢 [API] Request body:", body);
    
    const { name, city, type } = body;
    console.log("🟢 [API] Extracted fields - name:", name, "city:", city, "type:", type);

    if (!name || !city || !type) {
      console.error("🔴 [API] Validation failed - missing required fields");
      console.error("🔴 [API] name:", name, "city:", city, "type:", type);
      return NextResponse.json(
        { message: "All fields (name, city, type) are required." },
        { status: 400 }
      );
    }

    console.log("✅ [API] Validation passed");
    console.log("🟢 [API] Creating admin Supabase client...");
    const supabase = await createAdminClient();
    console.log("✅ [API] Admin client created");
    
    const insertPayload = {
      name: name.trim(),
      city: city.trim(),
      school_type: type.trim(),
    };
    console.log("🟢 [API] Insert payload:", insertPayload);

    console.log("🟢 [API] Inserting into database...");
    const { data, error } = await supabase
      .from("schools")
      .insert(insertPayload)
      .select()
      .single();
    
    console.log("🟢 [API] Database response - data:", data);
    console.log("🟢 [API] Database response - error:", error);

    if (error) {
      console.error("🔴 [API] Supabase error:", error);
      console.error("🔴 [API] Error message:", error.message);
      console.error("🔴 [API] Error details:", error.details);
      console.error("🔴 [API] Error hint:", error.hint);
      console.error("🔴 [API] Error code:", error.code);
      return NextResponse.json(
        { message: error.message, details: error.details, hint: error.hint, error: error.message },
        { status: 400 }
      );
    }

    if (!data) {
      console.error("🔴 [API] No data returned from insert");
      return NextResponse.json(
        { message: "School created but no data returned", error: "No data returned" },
        { status: 500 }
      );
    }

    console.log("✅ [API] School created successfully:", data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("🔴 [API] Caught exception in POST /api/schools:", error);
    console.error("🔴 [API] Error type:", typeof error);
    console.error("🔴 [API] Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error("🔴 [API] Error stack:", (error as any)?.stack);
    return NextResponse.json(
      { error: (error as any)?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
