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
  deviceInfo: string;
};

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
  emailVerified?: boolean;
};

export const usersApi = {
  searchUsers: async (q: string): Promise<UserSearchItem[]> => {
    const response = await http.get(`/users/search?q=${encodeURIComponent(q)}&size=20`);
    return response.data;
  },

  getUserById: async (id: string): Promise<UserProfile> => {
    const response = await http.get(`/users/${id}`);
    return response.data;
  },

  getSessions: async (): Promise<SessionItem[]> => {
    const response = await http.get('/users/me/sessions');
    return response.data;
  },

  revokeSession: async (sessionId: string): Promise<void> => {
    await http.delete(`/users/me/sessions/${sessionId}`);
  },

  updateProfile: async (data: Record<string, unknown>) => {
    const response = await http.patch('/users/me/profile', data);
    return response.data;
  },
};
