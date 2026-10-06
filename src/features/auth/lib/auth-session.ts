import { useSession } from '../store/session.store';

// A lightweight flag stored in sessionStorage to know whether the user
// previously authenticated in this browser tab. On a fresh visit the flag
// is absent, so we skip the /auth/refresh round-trip entirely.
const SESSION_FLAG_KEY = 'lc_session';

export const authSession = {
  /** Mark that an active session exists (call after successful login/register) */
  markActive: () => sessionStorage.setItem(SESSION_FLAG_KEY, '1'),

  /** Returns true if there may be a valid HttpOnly refresh-token cookie */
  mightBeActive: () => sessionStorage.getItem(SESSION_FLAG_KEY) === '1',

  refresh: async (): Promise<string> => {
    const { http } = await import('@/shared/api/http-client');
    // The HttpOnly cookie is sent automatically (withCredentials: true)
    const res = await http.post<{ accessToken: string }>('/auth/refresh');
    useSession.getState().setAccessToken(res.data.accessToken);
    return res.data.accessToken;
  },

  getFreshAccessToken: async (): Promise<string> => {
    const token = useSession.getState().accessToken;
    if (!token) throw new Error('No session');
    return token;
  },

  expire: () => {
    sessionStorage.removeItem(SESSION_FLAG_KEY);
    useSession.getState().clear();
    window.location.href = '/login';
  },
};
