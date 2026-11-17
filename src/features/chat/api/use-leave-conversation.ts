import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { showApiError } from '@/shared/api/api-error';
import { conversationsApi } from './conversations-api';

export function useLeaveConversation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (conversationId: string) => conversationsApi.leaveConversation(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.removeQueries({ queryKey: ['messages', conversationId] });
      toast.success('Conversation removed');
    },
    onError: (error) => {
      showApiError(error, 'Failed to leave conversation');
    },
  });
}
