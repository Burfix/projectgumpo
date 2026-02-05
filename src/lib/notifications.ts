/**
 * Notification System
 * Handles sending notifications to parents and staff via multiple channels
 */

export type NotificationType = 
  | 'incident_reported'
  | 'attendance_marked'
  | 'meal_logged'
  | 'nap_completed'
  | 'message_received'
  | 'payment_reminder'
  | 'general_announcement';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels?: ('push' | 'email' | 'sms' | 'in_app')[];
}

export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  incident_alerts: boolean;
  attendance_updates: boolean;
  meal_updates: boolean;
  payment_reminders: boolean;
  general_announcements: boolean;
}

/**
 * Send a notification to a user
 */
export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Notification failed: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

/**
 * Send notification to parent when incident is reported
 */
export async function notifyParentOfIncident(
  parentUserId: string,
  childName: string,
  incidentType: string,
  severity: string,
  description: string
): Promise<boolean> {
  const priority: NotificationPriority = 
    severity === 'serious' ? 'urgent' : 
    severity === 'moderate' ? 'high' : 'normal';

  return sendNotification({
    userId: parentUserId,
    type: 'incident_reported',
    priority,
    title: `Incident Report: ${childName}`,
    message: `${incidentType} - ${description.substring(0, 100)}...`,
    data: { childName, incidentType, severity, description },
    channels: severity === 'serious' ? ['push', 'sms', 'email', 'in_app'] : ['push', 'in_app'],
  });
}

/**
 * Send attendance notification to parent
 */
export async function notifyParentOfAttendance(
  parentUserId: string,
  childName: string,
  status: 'present' | 'absent' | 'late',
  timestamp: Date
): Promise<boolean> {
  if (status === 'present') {
    // Only notify for check-in, not normal attendance
    return sendNotification({
      userId: parentUserId,
      type: 'attendance_marked',
      priority: 'low',
      title: `${childName} checked in`,
      message: `${childName} arrived at ${timestamp.toLocaleTimeString()}`,
      data: { childName, status, timestamp: timestamp.toISOString() },
      channels: ['push', 'in_app'],
    });
  }

  return true;
}

/**
 * Send bulk notification to multiple users
 */
export async function sendBulkNotification(
  userIds: string[],
  notification: Omit<NotificationPayload, 'userId'>
): Promise<{ success: number; failed: number }> {
  const results = await Promise.allSettled(
    userIds.map(userId => 
      sendNotification({ ...notification, userId })
    )
  );

  const success = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
  const failed = results.length - success;

  return { success, failed };
}

/**
 * Get user notification preferences
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  try {
    const response = await fetch(`/api/notifications/preferences?userId=${userId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch notification preferences:', error);
    return null;
  }
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, preferences }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to update notification preferences:', error);
    return false;
  }
}
