import { NextResponse } from "next/server";
import { getSubscription } from "@/lib/db/secondaryPrincipalDashboard";

export async function GET() {
  try {
    const subscription = await getSubscription();
    return NextResponse.json({ subscription });
  } catch (error: any) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}
