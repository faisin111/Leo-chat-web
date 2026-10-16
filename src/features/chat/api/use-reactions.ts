import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showApiError } from '@/shared/api/api-error';
import { conversationsApi } from './conversations-api';

type ReactionPayload = {
  messageId: string;
  emoji: string;
  conversationId?: string;
};

export function useMessageReactions(conversationId?: string) {
  const queryClient = useQueryClient();

  const addReactionMutation = useMutation<void, Error, ReactionPayload>({
    mutationFn: ({ messageId, emoji }) => conversationsApi.addReaction(messageId, emoji),
    onSuccess: (_, { messageId, conversationId: convId }) => {
      const activeConvId = convId || conversationId;
      if (activeConvId) {
        queryClient.invalidateQueries({ queryKey: ['messages', activeConvId] });
      }
      queryClient.invalidateQueries({ queryKey: ['message', messageId] });
    },
    onError: (error) => {
      showApiError(error, 'Failed to add reaction');
    },
  });

  const removeReactionMutation = useMutation<void, Error, ReactionPayload>({
    mutationFn: ({ messageId, emoji }) => conversationsApi.removeReaction(messageId, emoji),
    onSuccess: (_, { messageId, conversationId: convId }) => {
      const activeConvId = convId || conversationId;
      if (activeConvId) {
        queryClient.invalidateQueries({ queryKey: ['messages', activeConvId] });
      }
      queryClient.invalidateQueries({ queryKey: ['message', messageId] });
    },
    onError: (error) => {
      showApiError(error, 'Failed to remove reaction');
    },
  });

  return {
    addReaction: addReactionMutation.mutate,
    removeReaction: removeReactionMutation.mutate,
    isAdding: addReactionMutation.isPending,
    isRemoving: removeReactionMutation.isPending,
  };
}
