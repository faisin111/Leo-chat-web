import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from './conversations-api';

type MarkReadPayload = {
  conversationId: string;
  upToSeq: number;
};

export function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, MarkReadPayload>({
    mutationFn: ({ conversationId, upToSeq }) =>
      conversationsApi.markConversationRead(conversationId, upToSeq),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
