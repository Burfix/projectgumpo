import { NextRequest, NextResponse } from "next/server";
import { sendIncidentEmail, sendMessageEmail, sendDailySummaryEmail } from "@/lib/email";
import { logError } from "@/lib/errors";

/**
 * POST /api/notifications/send-email
 * Send email notifications
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, data } = body;

    if (!type || !to || !data) {
      return NextResponse.json(
        { error: "Missing required fields: type, to, data" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case 'incident':
        result = await sendIncidentEmail(to, data);
        break;
      case 'message':
        result = await sendMessageEmail(to, data);
        break;
      case 'daily_summary':
        result = await sendDailySummaryEmail(to, data);
        break;
      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "POST /api/notifications/send-email" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to send email" },
      { status: 500 }
    );
  }
}
