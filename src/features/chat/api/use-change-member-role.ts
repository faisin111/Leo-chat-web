import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { showApiError } from '@/shared/api/api-error';
import { conversationsApi } from './conversations-api';

type ChangeMemberRolePayload = {
  conversationId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
};

export function useChangeMemberRole() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ChangeMemberRolePayload>({
    mutationFn: ({ conversationId, userId, role }) =>
      conversationsApi.updateMemberRole(conversationId, userId, role),
    onSuccess: (_, { conversationId, role }) => {
      queryClient.invalidateQueries({ queryKey: ['conversation-members', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      toast.success(`Member role changed to ${role}`);
    },
    onError: (error) => {
      showApiError(error, 'Failed to update member role');
    },
  });
}
