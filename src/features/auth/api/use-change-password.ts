import { useMutation } from '@tanstack/react-query';
import { authApi } from './auth-api';
import { toast } from 'sonner';
import { formatApiError } from '@/shared/api/api-error';

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      toast.error(formatApiError(error, 'Failed to change password'));
    },
  });
};
