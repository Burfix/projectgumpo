import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/errors";

/**
 * GET /api/super-admin/settings
 * Get system settings
 */
export async function GET() {
  try {
    const supabase = createAdminClient();
    
    const { data: settings, error } = await supabase
      .from("system_settings")
      .select("*")
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    // Return default settings if none exist
    if (!settings) {
      return NextResponse.json({
        maintenance_mode: false,
        session_timeout_minutes: 60,
        password_min_length: 8,
        password_require_uppercase: true,
        password_require_lowercase: true,
        password_require_numbers: true,
        password_require_special: false,
        max_login_attempts: 5,
        login_lockout_minutes: 15,
        email_notifications_enabled: true,
        smtp_host: "",
        smtp_port: 587,
        smtp_from_email: "",
        feature_flags: {
          messaging: true,
          photos: true,
          reports: true,
          audit_logs: true,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "GET /api/super-admin/settings" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/super-admin/settings
 * Update system settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    // Check if settings exist
    const { data: existing } = await supabase
      .from("system_settings")
      .select("id")
      .single();

    let result;
    if (existing) {
      // Update existing settings
      const { data, error } = await supabase
        .from("system_settings")
        .update(body)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert new settings
      const { data, error } = await supabase
        .from("system_settings")
        .insert(body)
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json(result);
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "PATCH /api/super-admin/settings" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
