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

export const usersApi = {
  searchUsers: async (q: string): Promise<UserSearchItem[]> => {
    const response = await http.get(`/users/search?q=${encodeURIComponent(q)}&size=20`);
    return response.data;
  },
};
