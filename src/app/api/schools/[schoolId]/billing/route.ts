import { NextResponse } from "next/server";
import { getSubscriptionBySchoolId, getAddOnsBySubscriptionId } from "@/lib/schools";

export async function GET(
  request: Request,
  { params }: { params: { schoolId: string } }
) {
  try {
    const schoolId = parseInt(params.schoolId);
    const subscription = await getSubscriptionBySchoolId(schoolId);
    
    if (!subscription) {
      return NextResponse.json({ subscription: null, addOns: [] });
    }
    
    const addOns = await getAddOnsBySubscriptionId(subscription.id);
    
    return NextResponse.json({ subscription, addOns });
  } catch (error) {
    console.error("Error fetching billing:", error);
    return NextResponse.json({ error: "Failed to fetch billing" }, { status: 500 });
  }
}
