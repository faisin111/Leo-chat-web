import { useSession } from '../store/session.store';

// Assuming refresh token is in HttpOnly cookie as per doc, so we just call /auth/refresh without body
// Or if it's in memory/sessionStorage until cookie is adopted, we can keep it here.
let refreshTokenStore: string | null = null;

export const tokenStorage = {
  getRefresh: () => refreshTokenStore || sessionStorage.getItem('refreshToken'),
  setRefresh: (token: string) => {
    refreshTokenStore = token;
    sessionStorage.setItem('refreshToken', token);
  },
  clear: () => {
    refreshTokenStore = null;
    sessionStorage.removeItem('refreshToken');
  },
};

import axios from 'axios';
import { env } from '@/shared/config/env';

export const authSession = {
  refresh: async (): Promise<string> => {
    const token = tokenStorage.getRefresh();
    const res = await axios.post<{ accessToken: string; refreshToken?: string }>(
      `${env.API_BASE_URL}/api/v1/auth/refresh`,
      { refreshToken: token },
    );

    if (res.data.refreshToken) {
      tokenStorage.setRefresh(res.data.refreshToken);
    }
    useSession.getState().setAccessToken(res.data.accessToken);
    return res.data.accessToken;
  },
  getFreshAccessToken: async (): Promise<string> => {
    const token = useSession.getState().accessToken;
    if (!token) throw new Error('No session');
    // Decoding JWT to check exp omitted for brevity, fallback to immediate refresh if close
    return token;
  },
  expire: () => {
    tokenStorage.clear();
    useSession.getState().clear();
    // Navigate to login omitted, usually done via router or event
    window.location.href = '/login';
  },
};
