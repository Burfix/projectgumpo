import { NextRequest, NextResponse } from "next/server";
import { getAllSubscriptions, getInvoices } from "@/lib/db/superAdminDashboard";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const schoolId = searchParams.get("school_id");
    const status = searchParams.get("status");

    if (type === "invoices") {
      const invoices = await getInvoices({
        school_id: schoolId || undefined,
        status: status || undefined,
      });
      return NextResponse.json(invoices);
    }

    const subscriptions = await getAllSubscriptions();
    return NextResponse.json(subscriptions);
  } catch (error: any) {
    console.error("Get billing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch billing data" },
      { status: error.message === "Not authenticated" ? 401 : 500 }
    );
  }
}
