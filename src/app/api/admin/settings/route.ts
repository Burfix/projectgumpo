import { NextRequest, NextResponse } from "next/server";
import { getSchoolSettings, updateSchoolSettings } from "@/lib/db/principalDashboard";
import { validateData, SettingsSchemas } from "@/lib/validation";
import { logError } from "@/lib/errors";

export async function GET() {
  try {
    const settings = await getSchoolSettings();
    return NextResponse.json(settings);
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'GET /api/admin/settings' });
    return NextResponse.json(
      { error: error.message || "Failed to fetch school settings" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = validateData(SettingsSchemas.update, body);
    if (!validationResult.success) {
      return validationResult.response;
    }
    
    const settings = await updateSchoolSettings(validationResult.data);
    return NextResponse.json(settings);
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'PATCH /api/admin/settings' });
    return NextResponse.json(
      { error: error.message || "Failed to update school settings" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
