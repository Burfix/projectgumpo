import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/db/principalDashboard";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
