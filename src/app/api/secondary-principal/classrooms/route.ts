import { NextResponse } from "next/server";
import { getClassrooms } from "@/lib/db/secondaryPrincipalDashboard";

export async function GET() {
  try {
    const classrooms = await getClassrooms();
    return NextResponse.json({ classrooms });
  } catch (error: any) {
    console.error("Error fetching classrooms:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch classrooms" },
      { status: 500 }
    );
  }
}
