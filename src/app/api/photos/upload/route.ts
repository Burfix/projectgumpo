import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logError } from "@/lib/errors";

/**
 * POST /api/photos/upload
 * Upload a photo to Supabase Storage and create database record
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("users")
      .select("id, school_id, role")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.school_id) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    // Only teachers and admins can upload photos
    if (!["TEACHER", "ADMIN", "PRINCIPAL"].includes(profile.role)) {
      return NextResponse.json({ error: "Only teachers can upload photos" }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const childId = formData.get("child_id") as string;
    const classroomId = formData.get("classroom_id") as string;
    const activityId = formData.get("activity_id") as string;
    const incidentId = formData.get("incident_id") as string;
    const caption = formData.get("caption") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, WEBP, and HEIC are allowed" }, { status: 400 });
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
    }

    // Generate unique file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split(".").pop();
    const fileName = `${profile.school_id}/${timestamp}-${randomString}.${extension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("activity-photos")
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("activity-photos")
      .getPublicUrl(fileName);

    // Create database record
    const { data: photoRecord, error: dbError } = await supabase
      .from("photos")
      .insert({
        school_id: profile.school_id,
        uploaded_by: user.id,
        child_id: childId ? parseInt(childId) : null,
        classroom_id: classroomId ? parseInt(classroomId) : null,
        activity_id: activityId ? parseInt(activityId) : null,
        incident_id: incidentId ? parseInt(incidentId) : null,
        storage_path: fileName,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        caption: caption || null,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from("activity-photos").remove([fileName]);
      throw new Error(`Database error: ${dbError.message}`);
    }

    return NextResponse.json({
      success: true,
      photo: {
        ...photoRecord,
        url: publicUrl,
      },
    });
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "POST /api/photos/upload" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to upload photo" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/photos/upload
 * Get photos for a child, classroom, or activity
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const childId = searchParams.get("child_id");
    const classroomId = searchParams.get("classroom_id");
    const activityId = searchParams.get("activity_id");
    const incidentId = searchParams.get("incident_id");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("photos")
      .select(`
        *,
        uploaded_by_user:users!uploaded_by(name, email),
        child:children(first_name, last_name)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (childId) query = query.eq("child_id", childId);
    if (classroomId) query = query.eq("classroom_id", classroomId);
    if (activityId) query = query.eq("activity_id", activityId);
    if (incidentId) query = query.eq("incident_id", incidentId);

    const { data: photos, error } = await query;

    if (error) throw error;

    // Add public URLs to photos
    const photosWithUrls = photos?.map((photo) => {
      const { data: { publicUrl } } = supabase.storage
        .from("activity-photos")
        .getPublicUrl(photo.storage_path);

      return {
        ...photo,
        url: publicUrl,
      };
    });

    return NextResponse.json(photosWithUrls || []);
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "GET /api/photos/upload" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/photos/upload
 * Update a photo record (e.g., add activity_id after activity is created)
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("id");
    const body = await request.json();

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }

    const { data: photo, error } = await supabase
      .from("photos")
      .update({
        activity_id: body.activity_id || null,
        caption: body.caption || null,
      })
      .eq("id", photoId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(photo);
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "PATCH /api/photos/upload" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to update photo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/photos/upload
 * Delete a photo
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get("id");

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }

    // Get photo record
    const { data: photo, error: fetchError } = await supabase
      .from("photos")
      .select("*")
      .eq("id", photoId)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("activity-photos")
      .remove([photo.storage_path]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("photos")
      .delete()
      .eq("id", photoId);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "DELETE /api/photos/upload" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to delete photo" },
      { status: 500 }
    );
  }
}
