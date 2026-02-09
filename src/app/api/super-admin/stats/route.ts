import { NextResponse } from "next/server";
import { getSystemStats } from "@/lib/db/superAdminDashboard";

export async function GET() {
  try {
    const stats = await getSystemStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("System stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch system stats" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}
