import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logError } from "@/lib/errors";

/**
 * GET /api/teacher/daily-activities
 * Get daily activities for teacher's classroom
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const classroomId = searchParams.get("classroom_id");

    if (!classroomId) {
      return NextResponse.json({ error: "Classroom ID required" }, { status: 400 });
    }

    const { data: activities, error } = await supabase
      .from("daily_activities")
      .select(`
        *,
        child:children(first_name, last_name, photo_url),
        photos(id, url:storage_path, caption, created_at)
      `)
      .eq("classroom_id", classroomId)
      .gte("activity_date", date)
      .lte("activity_date", date)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Add public URLs to photos
    const activitiesWithPhotoUrls = activities?.map((activity) => {
      const photosWithUrls = activity.photos?.map((photo: any) => {
        const { data: { publicUrl } } = supabase.storage
          .from("activity-photos")
          .getPublicUrl(photo.url);
        return { ...photo, url: publicUrl };
      });
      return { ...activity, photos: photosWithUrls };
    });

    return NextResponse.json(activitiesWithPhotoUrls || []);
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "GET /api/teacher/daily-activities" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to fetch daily activities" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teacher/daily-activities
 * Create a daily activity
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data: activity, error } = await supabase
      .from("daily_activities")
      .insert({
        child_id: body.child_id,
        classroom_id: body.classroom_id,
        activity_type: body.activity_type,
        description: body.description,
        activity_date: body.activity_date || new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(activity);
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "POST /api/teacher/daily-activities" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to create daily activity" },
      { status: 500 }
    );
  }
}
