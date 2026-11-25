import { describe, it, expect, vi, beforeEach } from 'vitest';
import { http } from '@/shared/api/http-client';
import { notificationsApi } from './notifications-api';

describe('notificationsApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('lists notifications with pagination and unreadOnly query params', async () => {
    const getSpy = vi.spyOn(http, 'get').mockResolvedValueOnce({
      data: {
        content: [
          {
            id: 'notif-1',
            type: 'NEW_MESSAGE',
            title: 'Alice',
            body: 'Hello there',
            referenceId: 'msg-1',
            conversationId: 'conv-1',
            createdAt: '2026-11-25T12:00:00Z',
            readAt: null,
            read: false,
          },
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
        size: 30,
        first: true,
        last: true,
        empty: false,
      },
    });

    const res = await notificationsApi.list({ page: 1, size: 20, unreadOnly: true });

    expect(getSpy).toHaveBeenCalledWith('/notifications', {
      params: { page: 1, size: 20, unreadOnly: true },
    });
    expect(res.content).toHaveLength(1);
    expect(res.totalElements).toBe(1);
    expect(res.last).toBe(true);
  });

  it('normalizes nested VIA_DTO Spring page metadata', async () => {
    vi.spyOn(http, 'get').mockResolvedValueOnce({
      data: {
        content: [],
        page: { number: 0, size: 30, totalElements: 45, totalPages: 2 },
      },
    });

    const res = await notificationsApi.list();

    expect(res.number).toBe(0);
    expect(res.totalElements).toBe(45);
    expect(res.totalPages).toBe(2);
    expect(res.last).toBe(false);
    expect(res.empty).toBe(true);
  });

  it('fetches unread count', async () => {
    const getSpy = vi.spyOn(http, 'get').mockResolvedValueOnce({
      data: { unreadCount: 7 },
    });

    const res = await notificationsApi.getUnreadCount();

    expect(getSpy).toHaveBeenCalledWith('/notifications/unread-count');
    expect(res.unreadCount).toBe(7);
  });

  it('marks one notification read, marks all read, and deletes a notification', async () => {
    const patchSpy = vi
      .spyOn(http, 'patch')
      .mockResolvedValueOnce({ data: { message: 'Notification marked as read' } })
      .mockResolvedValueOnce({ data: { markedRead: 4 } });
    const deleteSpy = vi.spyOn(http, 'delete').mockResolvedValueOnce({ data: undefined });

    const single = await notificationsApi.markRead('notif-1');
    const all = await notificationsApi.markAllRead();
    await notificationsApi.deleteNotification('notif-1');

    expect(patchSpy).toHaveBeenNthCalledWith(1, '/notifications/notif-1/read');
    expect(single.message).toBe('Notification marked as read');
    expect(patchSpy).toHaveBeenNthCalledWith(2, '/notifications/read-all');
    expect(all.markedRead).toBe(4);
    expect(deleteSpy).toHaveBeenCalledWith('/notifications/notif-1');
  });
});
