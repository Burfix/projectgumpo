import { NextResponse } from "next/server";
import { getInvoices } from "@/lib/db/secondaryPrincipalDashboard";

export async function GET() {
  try {
    const invoices = await getInvoices();
    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
