import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateData, MessageSchemas } from "@/lib/validation";
import { logError } from "@/lib/errors";

/**
 * GET /api/messages
 * Get messages for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile
    const { data: userData } = await supabase
      .from("users")
      .select("id, school_id, role")
      .eq("id", user.id)
      .single();

    if (!userData?.school_id) {
      return NextResponse.json({ error: "User not associated with a school" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'sent' or 'received'
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    let query = supabase
      .from("messages")
      .select(`
        id,
        sender_id,
        recipient_id,
        classroom_id,
        child_id,
        subject,
        body,
        message_type,
        priority,
        is_read,
        read_at,
        created_at,
        sender:users!messages_sender_id_fkey(id, name, email),
        recipient:users!messages_recipient_id_fkey(id, name, email),
        classrooms(id, name),
        children(id, first_name, last_name)
      `)
      .eq("school_id", userData.school_id)
      .order("created_at", { ascending: false });

    // Filter by sent or received
    if (type === "sent") {
      query = query.eq("sender_id", userData.id);
    } else if (type === "received") {
      query = query.eq("recipient_id", userData.id);
    } else {
      // Get both sent and received
      query = query.or(`sender_id.eq.${userData.id},recipient_id.eq.${userData.id}`);
    }

    // Filter unread only
    if (unreadOnly && type === "received") {
      query = query.eq("is_read", false);
    }

    const { data: messages, error } = await query;

    if (error) throw error;

    return NextResponse.json(messages || []);
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "GET /api/messages" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Create a new message
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile
    const { data: userData } = await supabase
      .from("users")
      .select("id, school_id, role")
      .eq("id", user.id)
      .single();

    if (!userData?.school_id) {
      return NextResponse.json({ error: "User not associated with a school" }, { status: 403 });
    }

    // Validate request body
    const body = await request.json();
    const validationResult = validateData(MessageSchemas.create, body);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const {
      recipientId,
      classroomId,
      childId,
      subject,
      body: messageBody,
      messageType,
      priority,
      attachments,
    } = validationResult.data;

    // Validate that either recipient or classroom is specified
    if (!recipientId && !classroomId && messageType !== 'announcement') {
      return NextResponse.json(
        { error: "Either recipientId or classroomId must be specified" },
        { status: 400 }
      );
    }

    // Insert message
    const { data: message, error: insertError } = await supabase
      .from("messages")
      .insert({
        school_id: userData.school_id,
        sender_id: userData.id,
        recipient_id: recipientId,
        classroom_id: classroomId,
        child_id: childId,
        subject,
        body: messageBody,
        message_type: messageType,
        priority,
        attachments,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "POST /api/messages" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to create message" },
      { status: 500 }
    );
  }
}
