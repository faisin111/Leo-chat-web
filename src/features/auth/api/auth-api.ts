import { http, clearCsrfToken } from '@/shared/api/http-client';
import { useSession } from '../store/session.store';
import type { RegisterFormValues } from '../schemas/auth.schema';

export type TokenResponse = {
  accessToken: string;
  tokenType: string;
  refreshToken?: string;
  expiresIn?: number;
  refreshExpiresIn?: number;
  id?: string;
  username?: string;
  email?: string;
  user?: unknown;
};

export const authApi = {
  getCsrf: async () => {
    const response = await http.get<{ headerName: string; token: string }>('/auth/csrf');
    return response.data;
  },

  register: async (data: RegisterFormValues) => {
    // Strip UI-only `terms` field and any undefined optional fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { terms: _terms, displayName, ...required } = data;

    const payload: Record<string, string> = { ...required };
    // Only include displayName if the user actually typed something
    if (displayName && displayName.trim().length > 0) {
      payload.displayName = displayName.trim();
    }

    const response = await http.post('/auth/register', payload);
    clearCsrfToken();
    return response.data;
  },

  login: async (data: { username: string; password: string }) => {
    const response = await http.post<TokenResponse>('/auth/login', data);
    clearCsrfToken();
    return response.data;
  },

  refresh: async (data?: { refreshToken?: string }) => {
    const response = await http.post<TokenResponse>('/auth/refresh', data);
    return response.data;
  },

  forgotPassword: async (data: { email: string }) => {
    const response = await http.post<{ message?: string }>('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    const response = await http.post<{ message?: string }>('/auth/reset-password', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await http.post<{ message?: string }>('/auth/change-password', data);
    return response.data;
  },

  verifyEmail: async (data: { token: string }) => {
    const response = await http.post<{ message?: string }>('/auth/verify-email', data);
    return response.data;
  },

  resendVerification: async (data?: { email?: string }) => {
    const email = data?.email || useSession.getState().user?.email;
    const response = await http.post<{ message?: string }>('/auth/resend-verification', {
      email,
    });
    return response.data;
  },

  getMe: async (token?: string) => {
    const response = await http.get('/users/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  logout: async () => {
    try {
      await http.post('/auth/logout');
    } finally {
      clearCsrfToken();
    }
  },
};
