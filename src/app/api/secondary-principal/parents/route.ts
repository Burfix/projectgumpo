import { NextResponse } from "next/server";
import { getParents } from "@/lib/db/secondaryPrincipalDashboard";

// Revalidate cache every 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    const parents = await getParents();
    return NextResponse.json({ parents });
  } catch (error: any) {
    console.error("Error fetching parents:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch parents" },
      { status: 500 }
    );
  }
}
