import { http } from '@/shared/api/http-client';

export type AdminStatsOverview = {
  totalUsers: number;
  totalConversations: number;
  totalReports: number;
};

export type AdminUserStatus = 'ACTIVE' | 'DISABLED' | 'BANNED';

export type AdminUserItem = {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  role: string;
  status: AdminUserStatus | string;
  createdAt?: string;
  lastSeenAt?: string;
  profilePictureUrl?: string;
  bio?: string;
  region?: string;
  age?: number;
};

export type AdminConversationStatus = 'ACTIVE' | 'ARCHIVED' | 'DELETED';

export type AdminConversationItem = {
  id: string;
  type: string;
  title: string | null;
  status: AdminConversationStatus | string;
  lastSeq?: number;
  createdBy?: string;
  createdAt: string;
  lastMessageAt: string | null;
};

export type AdminReportStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export type AdminReportItem = {
  id: string;
  reporterId: string;
  targetType: 'MESSAGE' | 'USER' | 'CONVERSATION' | string;
  targetId: string;
  reason: string;
  details?: string;
  status: AdminReportStatus;
  resolvedBy?: string | null;
  resolution?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
};

export type AdminAuditLogItem = {
  id: string;
  actorId?: string;
  actor?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
};

export type AdminPageResponse<T> = {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
};

export const adminApi = {
  getStatsOverview: async (): Promise<AdminStatsOverview> => {
    const response = await http.get('/admin/stats/overview');
    return response.data;
  },

  getUsers: async (params?: {
    q?: string;
    status?: string;
    cursor?: string | number;
    limit?: number;
  }): Promise<AdminPageResponse<AdminUserItem>> => {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.cursor !== undefined && params.cursor !== null)
      query.append('cursor', params.cursor.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const response = await http.get(`/admin/users?${query.toString()}`);
    return response.data;
  },

  getUser: async (id: string): Promise<AdminUserItem> => {
    const response = await http.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUserStatus: async (
    id: string,
    data: { status: AdminUserStatus; reason?: string },
  ): Promise<{ message: string }> => {
    const response = await http.patch(`/admin/users/${id}/status`, data);
    return response.data;
  },

  forceLogoutUser: async (id: string): Promise<{ message?: string }> => {
    const response = await http.post(`/admin/users/${id}/force-logout`);
    return response.data;
  },

  deleteUser: async (id: string): Promise<{ message: string }> => {
    const response = await http.delete(`/admin/users/${id}`);
    return response.data;
  },

  getConversations: async (params?: {
    q?: string;
    status?: string;
    cursor?: string | number;
  }): Promise<AdminPageResponse<AdminConversationItem>> => {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.cursor !== undefined && params.cursor !== null)
      query.append('cursor', params.cursor.toString());

    const response = await http.get(`/admin/conversations?${query.toString()}`);
    return response.data;
  },

  updateConversationStatus: async (
    id: string,
    data: { status: AdminConversationStatus; reason?: string },
  ): Promise<{ message: string }> => {
    const response = await http.patch(`/admin/conversations/${id}/status`, data);
    return response.data;
  },

  getReports: async (params?: {
    status?: string;
    cursor?: string | number;
  }): Promise<AdminPageResponse<AdminReportItem>> => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'ALL') query.append('status', params.status);
    if (params?.cursor !== undefined && params.cursor !== null)
      query.append('cursor', params.cursor.toString());

    const response = await http.get(`/admin/reports?${query.toString()}`);
    return response.data;
  },

  getReport: async (id: string): Promise<AdminReportItem> => {
    const response = await http.get(`/admin/reports/${id}`);
    return response.data;
  },

  resolveReport: async (
    id: string,
    data: { resolution: string; action?: string },
  ): Promise<{ message: string }> => {
    const response = await http.patch(`/admin/reports/${id}`, data);
    return response.data;
  },

  deleteMessage: async (id: string, reason: string): Promise<{ message: string }> => {
    const query = new URLSearchParams({ reason });
    const response = await http.delete(`/admin/messages/${id}?${query.toString()}`);
    return response.data;
  },

  getAuditLogs: async (params?: {
    actor?: string;
    action?: string;
    from?: string;
    to?: string;
    cursor?: string | number;
  }): Promise<AdminPageResponse<AdminAuditLogItem>> => {
    const query = new URLSearchParams();
    if (params?.actor) query.append('actor', params.actor);
    if (params?.action && params.action !== 'ALL') query.append('action', params.action);
    if (params?.from) query.append('from', params.from);
    if (params?.to) query.append('to', params.to);
    if (params?.cursor !== undefined && params.cursor !== null)
      query.append('cursor', params.cursor.toString());

    const response = await http.get(`/admin/audit-logs?${query.toString()}`);
    return response.data;
  },

  transferOwnership: async (data: {
    targetUserId: string;
    password: string;
  }): Promise<{ message: string }> => {
    const response = await http.post('/admin/transfer-ownership', data);
    return response.data;
  },
};
