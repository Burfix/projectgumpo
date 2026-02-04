import { NextResponse } from "next/server";
import { getOperationsSummary } from "@/lib/db/secondaryPrincipalDashboard";

export async function GET() {
  try {
    const operations = await getOperationsSummary();
    return NextResponse.json({ operations });
  } catch (error: any) {
    console.error("Error fetching operations summary:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch operations summary" },
      { status: 500 }
    );
  }
}
