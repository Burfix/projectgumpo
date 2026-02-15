import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateRequest, NotificationSchemas } from '@/lib/validation';
import { logError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/**
 * POST /api/notifications/send
 * Send a notification to a user via multiple channels
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const validationResult = await validateRequest(request, NotificationSchemas.send);
    if (!validationResult.success) {
      return validationResult.response;
    }

    const { userId, type, title, message, schoolId } = validationResult.data;

    // Get notification preferences for the user
    const { data: preferences, error: prefError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (prefError && prefError.code !== 'PGRST116') {
      logError(new Error('Error fetching preferences: ' + prefError.message), { context: 'POST /api/notifications/send - preferences' });
    }

    // Check if user has notifications enabled for this type
    const typeEnabled = checkNotificationTypeEnabled(type, preferences);
    if (!typeEnabled) {
      return NextResponse.json(
        { message: 'Notification disabled by user preferences', sent: false },
        { status: 200 }
      );
    }

    // Determine which channels to use based on preferences and priority
    const enabledChannels = getEnabledChannels(['in_app'], preferences, type);
    const priority = 'medium'; // Default priority
    const data = null; // Default data

    // Create in-app notification record
    const { error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        priority,
        title,
        message,
        data,
        channels: enabledChannels,
        read: false,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      logError(new Error('Error creating notification: ' + insertError.message), { context: 'POST /api/notifications/send - insert' });
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    // Send via enabled channels
    const channelResults = await Promise.allSettled(
      enabledChannels.map(channel => sendViaChannel(channel, {
        userId,
        title,
        message,
        data,
        priority,
      }))
    );

    const successCount = channelResults.filter(r => r.status === 'fulfilled').length;

    return NextResponse.json({
      success: true,
      sent: true,
      channels: enabledChannels,
      delivered: successCount,
    });

  } catch (error) {
    logError(error instanceof Error ? error : new Error(String(error)), { context: 'POST /api/notifications/send' });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check if notification type is enabled for user
 */
function checkNotificationTypeEnabled(
  type: string,
  preferences: any
): boolean {
  if (!preferences) return true; // Default to enabled if no preferences

  const typeMap: Record<string, string> = {
    'incident_reported': 'incident_alerts',
    'attendance_marked': 'attendance_updates',
    'meal_logged': 'meal_updates',
    'nap_completed': 'meal_updates',
    'payment_reminder': 'payment_reminders',
    'general_announcement': 'general_announcements',
  };

  const prefKey = typeMap[type];
  return prefKey ? preferences[prefKey] !== false : true;
}

/**
 * Get enabled channels based on preferences and priority
 */
function getEnabledChannels(
  requestedChannels: string[],
  preferences: any,
  priority: string
): string[] {
  if (!preferences) return requestedChannels;

  const enabled: string[] = ['in_app']; // Always enable in-app

  if (preferences.push_enabled && requestedChannels.includes('push')) {
    enabled.push('push');
  }

  if (preferences.email_enabled && requestedChannels.includes('email')) {
    enabled.push('email');
  }

  if (preferences.sms_enabled && requestedChannels.includes('sms')) {
    enabled.push('sms');
  }

  // For urgent notifications, override and use all available channels
  if (priority === 'urgent') {
    return Array.from(new Set([...enabled, ...requestedChannels]));
  }

  return enabled;
}

/**
 * Send notification via specific channel
 */
async function sendViaChannel(
  channel: string,
  payload: {
    userId: string;
    title: string;
    message: string;
    data?: any;
    priority: string;
  }
): Promise<boolean> {
  try {
    switch (channel) {
      case 'push':
        // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
        console.log('[PUSH] Sending notification:', payload.title);
        return true;

      case 'email':
        // TODO: Integrate with email service (SendGrid, Resend, etc.)
        console.log('[EMAIL] Sending notification:', payload.title);
        return true;

      case 'sms':
        // TODO: Integrate with SMS service (Twilio, etc.)
        console.log('[SMS] Sending notification:', payload.message);
        return true;

      case 'in_app':
        // Already handled by database insert
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.error(`Failed to send via ${channel}:`, error);
    return false;
  }
}
