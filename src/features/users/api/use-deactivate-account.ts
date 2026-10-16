import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from './users-api';
import { authSession } from '@/features/auth';
import { toast } from 'sonner';
import { showApiError } from '@/shared/api/api-error';

export function useDeactivateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => usersApi.deactivateAccount(),
    onSuccess: (res) => {
      toast.success(res?.message || 'Your account has been deactivated');
      queryClient.clear();
      authSession.expire();
    },
    onError: (err: unknown) => {
      showApiError(err, 'Failed to deactivate account');
    },
  });
}
