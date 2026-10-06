import { http } from '@/shared/api/http-client';
import type { RegisterFormValues } from '../schemas/auth.schema';

export const authApi = {
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
    return response.data;
  },
  login: async (data: { username: string; password: string }) => {
    const response = await http.post<{ accessToken: string; user: unknown }>('/auth/login', data);
    return response.data;
  },
};
