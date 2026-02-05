import { NextResponse } from "next/server";
import { getTeachers } from "@/lib/db/secondaryPrincipalDashboard";

// Revalidate cache every 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    const teachers = await getTeachers();
    return NextResponse.json({ teachers });
  } catch (error: any) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}
