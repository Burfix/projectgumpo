import { NextResponse } from "next/server";
import { getChildren } from "@/lib/db/secondaryPrincipalDashboard";

// Revalidate cache every 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    const children = await getChildren();
    return NextResponse.json({ children });
  } catch (error: any) {
    console.error("Error fetching children:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch children" },
      { status: 500 }
    );
  }
}
