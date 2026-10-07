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
  id: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
  lastActiveAt?: string;
  isCurrentSession?: boolean;
  deviceType?: string;
  os?: string;
  browser?: string;
  location?: string;
  // Fallback for dynamic fields
  [key: string]: unknown;
};

export const usersApi = {
  searchUsers: async (q: string): Promise<UserSearchItem[]> => {
    const response = await http.get(`/users/search?q=${encodeURIComponent(q)}&size=20`);
    return response.data;
  },

  getSessions: async (): Promise<SessionItem[]> => {
    const response = await http.get('/users/me/sessions');
    return response.data;
  },

  updateProfile: async (data: Record<string, unknown>) => {
    const response = await http.patch('/users/me/profile', data);
    return response.data;
  },
};
