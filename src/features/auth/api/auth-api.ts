import { http } from '@/shared/api/http-client';
import type { RegisterFormValues } from '../schemas/auth.schema';

export const authApi = {
  register: async (data: RegisterFormValues) => {
    const response = await http.post('/auth/register', data);
    return response.data;
  },
};
