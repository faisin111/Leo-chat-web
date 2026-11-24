import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi, type HideConversationsRequest } from './conversations-api';
import { toast } from 'sonner';

export function useHideConversation() {
  const queryClient = useQueryClient();

  const hideMutation = useMutation({
    mutationFn: (request: HideConversationsRequest) => conversationsApi.hideConversations(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      if (variables.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['conversation', variables.conversationId] });
        queryClient.removeQueries({ queryKey: ['messages', variables.conversationId] });
      }
      toast.success(
        variables.scope === 'ALL'
          ? 'All conversations hidden'
          : variables.scope === 'USER'
            ? 'Conversations with user hidden'
            : 'Conversation hidden from your chat list',
      );
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
            ? err.message
            : 'Failed to hide conversation';
      toast.error(msg || 'Failed to hide conversation');
    },
  });

  const unhideMutation = useMutation({
    mutationFn: (request: HideConversationsRequest) =>
      conversationsApi.unhideConversations(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      if (variables.conversationId) {
        queryClient.invalidateQueries({ queryKey: ['conversation', variables.conversationId] });
      }
      toast.success(
        variables.scope === 'ALL'
          ? 'All conversations unhidden'
          : variables.scope === 'USER'
            ? 'Conversations with user unhidden'
            : 'Conversation unhidden',
      );
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : err instanceof Error
            ? err.message
            : 'Failed to unhide conversation';
      toast.error(msg || 'Failed to unhide conversation');
    },
  });

  return {
    hide: hideMutation.mutate,
    hideAsync: hideMutation.mutateAsync,
    isHiding: hideMutation.isPending,
    unhide: unhideMutation.mutate,
    unhideAsync: unhideMutation.mutateAsync,
    isUnhiding: unhideMutation.isPending,
  };
}
