import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateData, MessageSchemas } from "@/lib/validation";
import { logError } from "@/lib/errors";

/**
 * PATCH /api/messages/[id]
 * Update a message (mark as read)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messageId = parseInt(id);
    if (isNaN(messageId) || messageId <= 0) {
      return NextResponse.json(
        { error: "Invalid message ID" },
        { status: 400 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validationResult = validateData(MessageSchemas.update, body);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const { isRead } = validationResult.data;

    // Get the message to verify access
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("id, recipient_id, sender_id")
      .eq("id", messageId)
      .single();

    if (fetchError || !message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Only recipient can mark as read, or sender can update their own messages
    if (message.recipient_id !== user.id && message.sender_id !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this message" },
        { status: 403 }
      );
    }

    // Update message
    const updateData: any = { is_read: isRead };
    if (isRead) {
      updateData.read_at = new Date().toISOString();
    }

    const { data: updatedMessage, error: updateError } = await supabase
      .from("messages")
      .update(updateData)
      .eq("id", messageId)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updatedMessage);
  } catch (error: any) {
    const { id } = await params;
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: `PATCH /api/messages/${id}` }
    );
    return NextResponse.json(
      { error: error.message || "Failed to update message" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/messages/[id]
 * Delete a message (only sender can delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messageId = parseInt(id);
    if (isNaN(messageId) || messageId <= 0) {
      return NextResponse.json(
        { error: "Invalid message ID" },
        { status: 400 }
      );
    }

    // Get the message to verify access
    const { data: message, error: fetchError } = await supabase
      .from("messages")
      .select("id, sender_id")
      .eq("id", messageId)
      .single();

    if (fetchError || !message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Only sender can delete
    if (message.sender_id !== user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this message" },
        { status: 403 }
      );
    }

    // Delete message
    const { error: deleteError } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    const { id } = await params;
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: `DELETE /api/messages/${id}` }
    );
    return NextResponse.json(
      { error: error.message || "Failed to delete message" },
      { status: 500 }
    );
  }
}
