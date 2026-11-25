import { http } from '@/shared/api/http-client';

export type NotificationType = 'NEW_MESSAGE' | 'MESSAGE_REACTION' | 'INCOMING_CALL' | string;

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  referenceId: string | null;
  conversationId: string | null;
  createdAt: string;
  readAt: string | null;
  read: boolean;
};

export type NotificationsPage = {
  content: AppNotification[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type NotificationUnreadCountResponse = {
  unreadCount: number;
};

export type MarkAllReadResponse = {
  markedRead: number;
};

export type ListNotificationsParams = {
  page?: number;
  size?: number;
  unreadOnly?: boolean;
};

type SpringPageRaw = Partial<NotificationsPage> & {
  page?: {
    size?: number;
    number?: number;
    totalElements?: number;
    totalPages?: number;
  };
};

function normalizeNotificationsPage(raw: SpringPageRaw | undefined): NotificationsPage {
  const content = Array.isArray(raw?.content) ? raw.content : [];
  const number = raw?.number ?? raw?.page?.number ?? 0;
  const size = raw?.size ?? raw?.page?.size ?? content.length;
  const totalElements = raw?.totalElements ?? raw?.page?.totalElements ?? content.length;
  const totalPages = raw?.totalPages ?? raw?.page?.totalPages ?? (content.length > 0 ? 1 : 0);
  const last = raw?.last ?? (totalPages === 0 ? true : number + 1 >= totalPages);

  return {
    content,
    totalElements,
    totalPages,
    number,
    size,
    first: raw?.first ?? number === 0,
    last,
    empty: raw?.empty ?? content.length === 0,
  };
}

export const notificationsApi = {
  list: async (params: ListNotificationsParams = {}): Promise<NotificationsPage> => {
    const page = params.page ?? 0;
    const size = params.size ?? 30;
    const unreadOnly = params.unreadOnly ?? false;
    const response = await http.get<SpringPageRaw>('/notifications', {
      params: { page, size, unreadOnly },
    });
    return normalizeNotificationsPage(response.data);
  },

  getUnreadCount: async (): Promise<NotificationUnreadCountResponse> => {
    const response = await http.get<NotificationUnreadCountResponse>('/notifications/unread-count');
    return {
      unreadCount: response.data?.unreadCount ?? 0,
    };
  },

  markRead: async (id: string): Promise<{ message: string }> => {
    const response = await http.patch<{ message: string }>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllRead: async (): Promise<MarkAllReadResponse> => {
    const response = await http.patch<MarkAllReadResponse>('/notifications/read-all');
    return {
      markedRead: response.data?.markedRead ?? 0,
    };
  },

  deleteNotification: async (id: string): Promise<void> => {
    await http.delete(`/notifications/${id}`);
  },
};
