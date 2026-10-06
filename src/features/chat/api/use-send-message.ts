import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from './conversations-api';
import type { SendMessageRequest } from './conversations-api';
import { toast } from 'sonner';

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<SendMessageRequest, 'conversationId'>) =>
      conversationsApi.sendMessage(conversationId, { ...data, conversationId }),
    onSuccess: () => {
      // Typically, we would invalidate the messages query for this conversation here.
      // E.g., queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      
      // Also might want to invalidate the conversations list to update the 'lastMessage'
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send message');
    },
  });
}
