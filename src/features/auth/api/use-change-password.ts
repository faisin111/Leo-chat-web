import { useMutation } from '@tanstack/react-query';
import { authApi } from './auth-api';
import { toast } from 'sonner';
import { formatApiError } from '@/shared/api/api-error';
import { authSession } from '../lib/auth-session';

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
    // The server signs out every session after a password change, so sign in again.
    onSuccess: async () => {
      toast.success('Password changed. Please sign in with your new password.');
      try {
        await authApi.logout();
      } catch {
        // Session already revoked server-side; clearing local state is enough.
      }
      authSession.expire();
    },
    onError: (error) => {
      toast.error(formatApiError(error, 'Failed to change password'));
    },
  });
};
