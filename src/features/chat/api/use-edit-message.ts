import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { showApiError } from '@/shared/api/api-error';
import { conversationsApi, type Message } from './conversations-api';

type EditMessagePayload = {
  messageId: string;
  content: string;
  conversationId?: string;
};

export function useEditMessage(conversationId?: string) {
  const queryClient = useQueryClient();

  return useMutation<Message, Error, EditMessagePayload>({
    mutationFn: ({ messageId, content }) => conversationsApi.editMessage(messageId, content),
    onSuccess: (updatedMsg, { conversationId: convId }) => {
      const activeConvId = convId || conversationId || updatedMsg.conversationId;
      if (activeConvId) {
        queryClient.invalidateQueries({ queryKey: ['messages', activeConvId] });
      }
      queryClient.invalidateQueries({ queryKey: ['message', updatedMsg.id] });
      toast.success('Message edited');
    },
    onError: (error) => {
      showApiError(error, 'Failed to edit message');
    },
  });
}
