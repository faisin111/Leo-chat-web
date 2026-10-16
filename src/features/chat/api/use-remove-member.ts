import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { showApiError } from '@/shared/api/api-error';
import { conversationsApi } from './conversations-api';

type RemoveMemberPayload = {
  conversationId: string;
  userId: string;
  isLeaving?: boolean;
};

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, RemoveMemberPayload>({
    mutationFn: ({ conversationId, userId }) =>
      conversationsApi.removeMember(conversationId, userId),
    onSuccess: (_, { conversationId, isLeaving }) => {
      queryClient.invalidateQueries({ queryKey: ['conversation-members', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      toast.success(isLeaving ? 'Left the conversation' : 'Member removed successfully');
    },
    onError: (error, { isLeaving }) => {
      showApiError(error, isLeaving ? 'Failed to leave conversation' : 'Failed to remove member');
    },
  });
}
