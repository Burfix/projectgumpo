import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  sendNotification,
  notifyParentOfIncident,
  notifyParentOfAttendance,
  sendBulkNotification,
} from '@/lib/notifications';

// Mock fetch globally
global.fetch = vi.fn();

describe('Notification System', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendNotification', () => {
    it('should send notification successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await sendNotification({
        userId: 'user-123',
        type: 'incident_reported',
        priority: 'high',
        title: 'Test Notification',
        message: 'Test message',
      });

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/notifications/send',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle failed notification', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const result = await sendNotification({
        userId: 'user-123',
        type: 'incident_reported',
        priority: 'high',
        title: 'Test Notification',
        message: 'Test message',
      });

      expect(result).toBe(false);
    });

    it('should include optional data and channels', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await sendNotification({
        userId: 'user-123',
        type: 'incident_reported',
        priority: 'urgent',
        title: 'Urgent Alert',
        message: 'Critical incident',
        data: { incidentId: 456 },
        channels: ['push', 'email', 'sms'],
      });

      const callArgs = (global.fetch as any).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.data).toEqual({ incidentId: 456 });
      expect(body.channels).toEqual(['push', 'email', 'sms']);
    });
  });

  describe('notifyParentOfIncident', () => {
    it('should send incident notification with correct priority', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await notifyParentOfIncident(
        'parent-123',
        'John Doe',
        'Minor injury',
        'serious',
        'Child fell and scraped knee'
      );

      const callArgs = (global.fetch as any).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.type).toBe('incident_reported');
      expect(body.priority).toBe('urgent');
      expect(body.title).toContain('John Doe');
      expect(body.channels).toContain('sms');
    });

    it('should use normal priority for minor incidents', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await notifyParentOfIncident(
        'parent-123',
        'Jane Doe',
        'Minor scratch',
        'minor',
        'Small scratch on arm'
      );

      const callArgs = (global.fetch as any).mock.calls[0][1];
      const body = JSON.parse(callArgs.body);

      expect(body.priority).toBe('normal');
      expect(body.channels).not.toContain('sms');
    });
  });

  describe('notifyParentOfAttendance', () => {
    it('should send attendance notification for check-in', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const timestamp = new Date();
      const result = await notifyParentOfAttendance(
        'parent-123',
        'John Doe',
        'present',
        timestamp
      );

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should not send notification for normal attendance', async () => {
      const result = await notifyParentOfAttendance(
        'parent-123',
        'John Doe',
        'absent',
        new Date()
      );

      expect(result).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('sendBulkNotification', () => {
    it('should send notifications to multiple users', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const userIds = ['user-1', 'user-2', 'user-3'];
      const result = await sendBulkNotification(userIds, {
        type: 'general_announcement',
        priority: 'normal',
        title: 'School Closure',
        message: 'School will be closed tomorrow',
      });

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures', async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ ok: true });

      const userIds = ['user-1', 'user-2', 'user-3'];
      const result = await sendBulkNotification(userIds, {
        type: 'general_announcement',
        priority: 'normal',
        title: 'Test',
        message: 'Test message',
      });

      expect(result.success).toBe(2);
      expect(result.failed).toBe(1);
    });
  });
});
