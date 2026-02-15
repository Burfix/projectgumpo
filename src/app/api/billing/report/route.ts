import { NextResponse } from "next/server";
import { generateBillingReport } from "@/lib/schools";
import { logError } from "@/lib/errors";

export async function GET() {
  try {
    const report = await generateBillingReport();
    return NextResponse.json(report);
  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'GET /api/billing/report' });
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
