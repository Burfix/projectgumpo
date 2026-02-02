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

    // Try direct insert with explicit column names
    try {
      const { data, error } = await supabase
        .from("schools")
        .insert({
          name: name.trim(),
          location: location ? location.trim() : null,
          subscription_tier: subscription_tier || "Starter",
          account_status: account_status || "Trial",
        })
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: "School created but no data returned" },
          { status: 500 }
        );
      }

      return NextResponse.json(data[0], { status: 201 });
    } catch (insertError: any) {
      console.error("Insert error:", insertError);
      
      // If schema cache error, try without select
      if (insertError?.message?.includes('schema cache')) {
        const { error: simpleError } = await supabase
          .from("schools")
          .insert({
            name: name.trim(),
            location: location ? location.trim() : null,
            subscription_tier: subscription_tier || "Starter",
            account_status: account_status || "Trial",
          });

        if (simpleError) {
          throw simpleError;
        }

        // Return success with the input data
        return NextResponse.json({
          name: name.trim(),
          location: location ? location.trim() : null,
          subscription_tier: subscription_tier || "Starter",
          account_status: account_status || "Trial",
        }, { status: 201 });
      }

      throw insertError;
    }
  } catch (error) {
    console.error("Error in POST /api/schools:", error);
    return NextResponse.json(
      { error: (error as any)?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
