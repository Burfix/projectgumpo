import { NextResponse } from "next/server";
import { getAllInvites } from "@/lib/db/superAdminDashboard";

export async function GET() {
  try {
    const invites = await getAllInvites();
    return NextResponse.json(invites);
  } catch (error: any) {
    console.error("Get invites error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch invites" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}
