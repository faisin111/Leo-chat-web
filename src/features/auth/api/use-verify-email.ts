import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from './auth-api';
import { toast } from 'sonner';
import { formatApiError } from '@/shared/api/api-error';
import { useSession } from '../store/session.store';

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();
  const setUser = useSession((s) => s.setUser);
  const user = useSession((s) => s.user);

  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      toast.success('Email successfully verified!');
      // Update session store if possible
      if (user) {
        setUser({
          ...user,
          isEmailVerified: true,
          emailVerified: true,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error) => {
      toast.error(formatApiError(error, 'Failed to verify email'));
    },
  });
};
