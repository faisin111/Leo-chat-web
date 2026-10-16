import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from './conversations-api';
import type { SendMessageRequest } from './conversations-api';
import { showApiError } from '@/shared/api/api-error';

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<SendMessageRequest, 'conversationId'>) =>
      conversationsApi.sendMessage(conversationId, { ...data, conversationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: Error) => {
      showApiError(error, 'Failed to send message');
    },
  });
}
