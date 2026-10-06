import { http } from '@/shared/api/http-client';
import type { RegisterFormValues } from '../schemas/auth.schema';

export const authApi = {
  register: async (data: RegisterFormValues) => {
    // Strip `terms` — it's UI-only and not part of the API payload
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { terms: _terms, ...payload } = data;
    const response = await http.post('/auth/register', payload);
    return response.data;
  },
};
