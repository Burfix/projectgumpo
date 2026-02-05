-- Migration: Add notifications and notification preferences tables
-- This enables in-app notifications and user notification settings

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'incident_reported',
        'attendance_marked',
        'meal_logged',
        'nap_completed',
        'message_received',
        'payment_reminder',
        'general_announcement'
    )),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    channels TEXT[] DEFAULT ARRAY['in_app']::TEXT[],
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    push_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    incident_alerts BOOLEAN DEFAULT TRUE,
    attendance_updates BOOLEAN DEFAULT TRUE,
    meal_updates BOOLEAN DEFAULT FALSE,
    payment_reminders BOOLEAN DEFAULT TRUE,
    general_announcements BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications table

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (
        auth.uid() = user_id
    );

-- Staff can create notifications for parents
CREATE POLICY "Staff can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'TEACHER')
        )
    );

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own old notifications
CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    USING (
        auth.uid() = user_id
        AND created_at < NOW() - INTERVAL '30 days'
    );

-- RLS Policies for notification_preferences table

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
    ON notification_preferences FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
    ON notification_preferences FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
    ON notification_preferences FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Function to automatically clean up old notifications (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND read = TRUE;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run cleanup daily
CREATE OR REPLACE FUNCTION trigger_cleanup_notifications()
RETURNS void AS $$
BEGIN
    PERFORM cleanup_old_notifications();
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notification_preferences TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE notifications_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE notification_preferences_id_seq TO authenticated;

-- Comments for documentation
COMMENT ON TABLE notifications IS 'Stores all notifications sent to users across different channels';
COMMENT ON TABLE notification_preferences IS 'User preferences for notification channels and types';
COMMENT ON COLUMN notifications.type IS 'Type of notification (incident, attendance, meal, etc.)';
COMMENT ON COLUMN notifications.priority IS 'Urgency level affecting delivery channels';
COMMENT ON COLUMN notifications.channels IS 'Channels used to deliver this notification';
COMMENT ON COLUMN notifications.data IS 'Additional structured data specific to notification type';
