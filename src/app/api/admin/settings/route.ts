import { NextRequest, NextResponse } from "next/server";
import { getSchoolSettings, updateSchoolSettings } from "@/lib/db/principalDashboard";

export async function GET() {
  try {
    const settings = await getSchoolSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Get school settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch school settings" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = await updateSchoolSettings(body);
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Update school settings error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update school settings" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
