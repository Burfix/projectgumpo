import { NextRequest, NextResponse } from "next/server";
import { getGrowthMetrics, getSchoolStatuses } from "@/lib/db/superAdminDashboard";
import { logError } from "@/lib/errors";

export async function GET() {
  try {
    const [growth, statuses] = await Promise.all([
      getGrowthMetrics(),
      getSchoolStatuses(),
    ]);

    return NextResponse.json({
      growth,
      statuses,
    });
  } catch (error: any) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'GET /api/super-admin/analytics' });
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}
