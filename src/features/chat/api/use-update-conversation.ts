import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { showApiError } from '@/shared/api/api-error';
import { conversationsApi, type Conversation } from './conversations-api';

type UpdateConversationPayload = {
  id: string;
  data: {
    title?: string;
    avatarUrl?: string;
  };
};

export function useUpdateConversation() {
  const queryClient = useQueryClient();

  return useMutation<Conversation, Error, UpdateConversationPayload>({
    mutationFn: ({ id, data }) => conversationsApi.updateConversation(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', id] });
      toast.success('Conversation updated successfully');
    },
    onError: (error) => {
      showApiError(error, 'Failed to update conversation');
    },
  });
}
