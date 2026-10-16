import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { showApiError } from '@/shared/api/api-error';
import { conversationsApi } from './conversations-api';

export function usePinConversation() {
  const queryClient = useQueryClient();

  const pinMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => conversationsApi.pinConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['conversation-members', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', id] });
      toast.success('Conversation pinned');
    },
    onError: (error) => {
      showApiError(error, 'Failed to pin conversation');
    },
  });

  const unpinMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => conversationsApi.unpinConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['conversation-members', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', id] });
      toast.success('Conversation unpinned');
    },
    onError: (error) => {
      showApiError(error, 'Failed to unpin conversation');
    },
  });

  return {
    pin: pinMutation.mutate,
    unpin: unpinMutation.mutate,
    isPinning: pinMutation.isPending,
    isUnpinning: unpinMutation.isPending,
    isLoading: pinMutation.isPending || unpinMutation.isPending,
  };
}
