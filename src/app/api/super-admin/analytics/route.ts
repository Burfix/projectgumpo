import { NextRequest, NextResponse } from "next/server";
import { getGrowthMetrics, getSchoolStatuses } from "@/lib/db/superAdminDashboard";

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
    console.error("Get analytics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}
