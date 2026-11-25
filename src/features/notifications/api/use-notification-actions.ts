import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { qk } from '@/shared/api/query-keys';
import {
  notificationsApi,
  type NotificationsPage,
  type NotificationUnreadCountResponse,
} from './notifications-api';

function wasItemUnread(
  pagesList: Array<[readonly unknown[], InfiniteData<NotificationsPage> | undefined]>,
  id: string,
): boolean {
  for (const [, data] of pagesList) {
    if (!data) continue;
    for (const page of data.pages) {
      const match = page.content.find((item) => item.id === id);
      if (match) return !match.read;
    }
  }
  return false;
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: qk.notifications.all });
      const cachedLists = queryClient.getQueriesData<InfiniteData<NotificationsPage>>({
        queryKey: ['notifications', 'list'],
      });
      const prevUnread = queryClient.getQueryData<NotificationUnreadCountResponse>(
        qk.notifications.unreadCount,
      );
      const shouldDecrement = wasItemUnread(cachedLists, id);
      const nowIso = new Date().toISOString();

      queryClient.setQueriesData<InfiniteData<NotificationsPage>>(
        { queryKey: ['notifications', 'list'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((item) =>
                item.id === id && !item.read ? { ...item, read: true, readAt: nowIso } : item,
              ),
            })),
          };
        },
      );

      if (shouldDecrement && prevUnread) {
        queryClient.setQueryData<NotificationUnreadCountResponse>(qk.notifications.unreadCount, {
          unreadCount: Math.max(0, prevUnread.unreadCount - 1),
        });
      }

      return { cachedLists, prevUnread };
    },
    onError: (_err, _id, context) => {
      context?.cachedLists.forEach(([key, value]) => queryClient.setQueryData(key, value));
      if (context?.prevUnread) {
        queryClient.setQueryData(qk.notifications.unreadCount, context.prevUnread);
      }
      toast.error('Unable to mark notification as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.notifications.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: qk.notifications.all });
      const cachedLists = queryClient.getQueriesData<InfiniteData<NotificationsPage>>({
        queryKey: ['notifications', 'list'],
      });
      const prevUnread = queryClient.getQueryData<NotificationUnreadCountResponse>(
        qk.notifications.unreadCount,
      );
      const nowIso = new Date().toISOString();

      queryClient.setQueriesData<InfiniteData<NotificationsPage>>(
        { queryKey: ['notifications', 'list'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.map((item) =>
                item.read ? item : { ...item, read: true, readAt: nowIso },
              ),
            })),
          };
        },
      );

      queryClient.setQueryData<NotificationUnreadCountResponse>(qk.notifications.unreadCount, {
        unreadCount: 0,
      });

      return { cachedLists, prevUnread };
    },
    onSuccess: (res) => {
      if (res.markedRead > 0) {
        toast.success(
          `Marked ${res.markedRead} notification${res.markedRead === 1 ? '' : 's'} as read`,
        );
      }
    },
    onError: (_err, _vars, context) => {
      context?.cachedLists.forEach(([key, value]) => queryClient.setQueryData(key, value));
      if (context?.prevUnread) {
        queryClient.setQueryData(qk.notifications.unreadCount, context.prevUnread);
      }
      toast.error('Unable to mark all notifications as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.notifications.all });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: qk.notifications.all });
      const cachedLists = queryClient.getQueriesData<InfiniteData<NotificationsPage>>({
        queryKey: ['notifications', 'list'],
      });
      const prevUnread = queryClient.getQueryData<NotificationUnreadCountResponse>(
        qk.notifications.unreadCount,
      );
      const shouldDecrement = wasItemUnread(cachedLists, id);

      queryClient.setQueriesData<InfiniteData<NotificationsPage>>(
        { queryKey: ['notifications', 'list'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              content: page.content.filter((item) => item.id !== id),
              totalElements: Math.max(0, page.totalElements - 1),
            })),
          };
        },
      );

      if (shouldDecrement && prevUnread) {
        queryClient.setQueryData<NotificationUnreadCountResponse>(qk.notifications.unreadCount, {
          unreadCount: Math.max(0, prevUnread.unreadCount - 1),
        });
      }

      return { cachedLists, prevUnread };
    },
    onSuccess: () => {
      toast.success('Notification deleted');
    },
    onError: (_err, _id, context) => {
      context?.cachedLists.forEach(([key, value]) => queryClient.setQueryData(key, value));
      if (context?.prevUnread) {
        queryClient.setQueryData(qk.notifications.unreadCount, context.prevUnread);
      }
      toast.error('Unable to delete notification');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qk.notifications.all });
    },
  });
}
