import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Admin API Routes
 * Add your API endpoints here
 */

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Add your API logic here

    return NextResponse.json({ message: "Admin API ready" });
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
