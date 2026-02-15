import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getParentMessages, markMessageAsRead } from "@/lib/db/parentDashboard";
import { validateRequest, MessageSchemas } from "@/lib/validation";
import { logError } from "@/lib/errors";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("users")
      .select("id, name, role")
      .eq("email", user.email)
      .single();

    if (!profile || profile.role !== "PARENT") {
      return NextResponse.json(
        { error: "Not authorized as parent" },
        { status: 403 }
      );
    }

    // Get messages
    const messages = await getParentMessages(profile.id);

    return NextResponse.json({ messages });

  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'GET /api/parent/messages' });
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", user.email)
      .single();

    if (!profile || profile.role !== "PARENT") {
      return NextResponse.json(
        { error: "Not authorized as parent" },
        { status: 403 }
      );
    }

    const validationResult = await validateRequest(request, MessageSchemas.markRead);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const { messageId } = validationResult.data;

    // Verify message belongs to this parent
    const { data: message } = await supabase
      .from("messages")
      .select("recipient_id")
      .eq("id", messageId)
      .single();

    if (!message || message.recipient_id !== profile.id) {
      return NextResponse.json(
        { error: "Message not found or access denied" },
        { status: 404 }
      );
    }

    // Mark as read
    await markMessageAsRead(messageId);

    return NextResponse.json({ success: true });

  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'PATCH /api/parent/messages' });
    return NextResponse.json(
      { error: "Failed to mark message as read" },
      { status: 500 }
    );
  }
}
