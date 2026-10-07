import { useMutation } from '@tanstack/react-query';
import { authApi } from './auth-api';
import { toast } from 'sonner';
import { formatApiError } from '@/shared/api/api-error';

export const useResendVerification = () => {
  return useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => {
      toast.success('Verification email sent! Please check your inbox.');
    },
    onError: (error) => {
      toast.error(formatApiError(error, 'Failed to send verification email'));
    },
  });
};
