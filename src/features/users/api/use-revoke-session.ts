import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from './users-api';
import { toast } from 'sonner';
import { formatApiError } from '@/shared/api/api-error';

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => usersApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session signed out successfully');
    },
    onError: (error) => {
      toast.error(formatApiError(error, 'Failed to sign out session'));
    },
  });
};
