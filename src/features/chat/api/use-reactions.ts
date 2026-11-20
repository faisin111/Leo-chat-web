import { useMutation } from '@tanstack/react-query';
import { showApiError } from '@/shared/api/api-error';
import { conversationsApi } from './conversations-api';

type ReactionPayload = {
  messageId: string;
  emoji: string;
  conversationId?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useMessageReactions(_conversationId?: string) {
  const addReactionMutation = useMutation<void, Error, ReactionPayload>({
    mutationFn: ({ messageId, emoji }) => conversationsApi.addReaction(messageId, emoji),
    onError: (error) => {
      showApiError(error, 'Failed to add reaction');
    },
  });

  const removeReactionMutation = useMutation<void, Error, ReactionPayload>({
    mutationFn: ({ messageId, emoji }) => conversationsApi.removeReaction(messageId, emoji),
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
