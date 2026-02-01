import { NextResponse } from "next/server";
import { getSchoolById } from "@/lib/schools";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId } = await params;
    const school = await getSchoolById(parseInt(schoolId));
    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }
    return NextResponse.json(school);
  } catch (error) {
    console.error("Error fetching school:", error);
    return NextResponse.json({ error: "Failed to fetch school" }, { status: 500 });
  }
}
