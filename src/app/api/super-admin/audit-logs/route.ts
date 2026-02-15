import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs } from "@/lib/db/superAdminDashboard";
import { logError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("school_id");
    const userId = searchParams.get("user_id");
    const action = searchParams.get("action");
    const limit = searchParams.get("limit");

    const logs = await getAuditLogs({
      school_id: schoolId || undefined,
      user_id: userId || undefined,
      action: action || undefined,
      limit: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'GET /api/super-admin/audit-logs' });
    return NextResponse.json(
      { error: error.message || "Failed to fetch audit logs" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}
