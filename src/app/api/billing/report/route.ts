import { NextResponse } from "next/server";
import { generateBillingReport } from "@/lib/schools";

export async function GET() {
  try {
    const report = await generateBillingReport();
    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating billing report:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
