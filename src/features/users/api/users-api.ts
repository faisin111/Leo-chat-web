import { http } from '@/shared/api/http-client';

export type UserSearchItem = {
  id: string;
  username: string;
  displayName?: string;
  lastSeenAt?: string;
  status: string;
  profilePictureUrl?: string;
  bio?: string;
  region?: string;
  age?: number;
};

export type SessionItem = {
  sessionId: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt?: string;
  logoutAt?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
  deviceName?: string | null;
  platform?: string | null;
  appVersion?: string | null;
  active?: boolean;
  deviceInfo?: string;
};

export type UserSessionResponse = SessionItem;

export type UserProfile = {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  role?: string;
  profilePictureUrl?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
  age?: number | null;
  region?: string | null;
  isEmailVerified?: boolean;
  emailVerified?: boolean;
};

export type ProfileUpdateBody = {
  profilePictureUrl?: string;
  phoneNumber?: string;
  bio?: string;
  age?: number;
  region?: string;
  displayName?: string;
};

export type PresenceItem = {
  userId: string;
  id: string;
  status: string;
  lastSeenAt?: string;
};

export const usersApi = {
  getMe: async (): Promise<UserProfile> => {
    const response = await http.get('/users/me');
    return response.data;
  },

  getUserById: async (id: string): Promise<UserProfile> => {
    const response = await http.get(`/users/${id}`);
    return response.data;
  },

  updateProfile: async (data: ProfileUpdateBody): Promise<{ message: string }> => {
    const response = await http.patch('/users/me/profile', data);
    return response.data;
  },

  deactivateAccount: async (): Promise<{ message: string }> => {
    const response = await http.delete('/users/me');
    return response.data;
  },

  searchUsers: async (
    q: string,
    page: number = 0,
    size: number = 20,
  ): Promise<UserSearchItem[]> => {
    const params = new URLSearchParams({
      q: q.trim(),
      page: page.toString(),
      size: size.toString(),
    });
    const response = await http.get(`/users/search?${params.toString()}`);
    return response.data;
  },

  getPresence: async (ids: string[]): Promise<PresenceItem[]> => {
    if (!ids || ids.length === 0) return [];
    const params = new URLSearchParams();
    ids.forEach((id) => params.append('ids', id));
    const response = await http.get<
      Array<{ userId?: string; id?: string; status: string; lastSeenAt?: string }>
    >(`/users/presence?${params.toString()}`);
    return (response.data || []).map((item) => ({
      userId: item.userId || item.id || '',
      id: item.userId || item.id || '',
      status: item.status,
      lastSeenAt: item.lastSeenAt,
    }));
  },

  getSessions: async (): Promise<SessionItem[]> => {
    const response = await http.get('/users/me/sessions');
    return response.data;
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    await http.delete(`/users/me/sessions/${sessionId}`);
  },
};
