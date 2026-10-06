import { create } from 'zustand';

// Placeholder for CurrentUser
export type CurrentUser = {
  id: string;
  username: string;
  displayName?: string;
  role: 'USER' | 'ADMIN';
  mustChangePassword?: boolean;
};

type SessionState = {
  status: 'unknown' | 'anonymous' | 'authenticated';
  accessToken: string | null;
  user: CurrentUser | null;
  setSession: (token: string, user: CurrentUser) => void;
  setAccessToken: (token: string) => void;
  clear: () => void;
};

export const useSession = create<SessionState>()((set) => ({
  status: 'unknown',
  accessToken: null,
  user: null,
  setSession: (accessToken, user) => set({ status: 'authenticated', accessToken, user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clear: () => set({ status: 'anonymous', accessToken: null, user: null }),
}));
