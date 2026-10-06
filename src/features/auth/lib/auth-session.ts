import { useSession } from '../store/session.store';
import { http } from '@/shared/api/http-client';

// Lightweight flag stored in sessionStorage to indicate if user previously authenticated.
const SESSION_FLAG_KEY = 'lc_session';

export const authSession = {
  /** Mark that an active session exists (call after successful login/register) */
  markActive: () => sessionStorage.setItem(SESSION_FLAG_KEY, '1'),

  /** Returns true if there may be a valid HttpOnly refresh-token cookie */
  mightBeActive: () => sessionStorage.getItem(SESSION_FLAG_KEY) === '1',

  /** Refresh token using HttpOnly cookie; updates session store */
  refresh: async (): Promise<string> => {
    const res = await http.post<{ accessToken: string }>('/auth/refresh');
    useSession.getState().setAccessToken(res.data.accessToken);
    return res.data.accessToken;
  },

  /** Get current access token, throws if none */
  getFreshAccessToken: async (): Promise<string> => {
    const token = useSession.getState().accessToken;
    if (!token) throw new Error('No session');
    return token;
  },

  /** Expire session: clear flag and store */
  expire: () => {
    sessionStorage.removeItem(SESSION_FLAG_KEY);
    useSession.getState().clear();
  },
};
