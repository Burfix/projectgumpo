import { NextResponse } from "next/server";
import { getSchools } from "@/lib/schools";
import { createAdminClient } from "@/lib/supabase/admin";
import { protectApiRoute } from "@/lib/auth/middleware";
import { validateRequest, SchoolSchemas } from "@/lib/validation";
import { DatabaseError, logError } from "@/lib/errors";

export async function GET() {
  try {
    const schools = await getSchools();
    return NextResponse.json(schools);
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'GET /api/schools' });
    return NextResponse.json({ error: "Failed to fetch schools" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Verify user is super admin
    await protectApiRoute(["SUPER_ADMIN"]);

    // Validate request body with Zod schema
    const validationResult = await validateRequest(request, SchoolSchemas.create);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const { name, city, type, address, phone } = validationResult.data;

    const supabase = await createAdminClient();
    
    const insertPayload = {
      name,
      city,
      school_type: type,
      ...(address && { address }),
      ...(phone && { phone }),
    };

    const { data, error } = await supabase
      .from("schools")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      logError(error, { context: 'POST /api/schools', payload: insertPayload });
      throw DatabaseError.queryFailed(error.message);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'POST /api/schools' });
    return NextResponse.json(
      { error: "Failed to create school" },
      { status: 500 }
    );
  }
}
