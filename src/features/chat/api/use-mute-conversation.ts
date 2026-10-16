import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { showApiError } from '@/shared/api/api-error';
import { conversationsApi } from './conversations-api';

export function useMuteConversation() {
  const queryClient = useQueryClient();

  const muteMutation = useMutation<void, Error, { id: string; mutedUntil: string }>({
    mutationFn: ({ id, mutedUntil }) => conversationsApi.muteConversation(id, mutedUntil),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['conversation-members', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', id] });
      toast.success('Conversation muted');
    },
    onError: (error) => {
      showApiError(error, 'Failed to mute conversation');
    },
  });

  const unmuteMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => conversationsApi.unmuteConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['conversation-members', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', id] });
      toast.success('Conversation unmuted');
    },
    onError: (error) => {
      showApiError(error, 'Failed to unmute conversation');
    },
  });

  return {
    mute: muteMutation.mutate,
    unmute: unmuteMutation.mutate,
    isMuting: muteMutation.isPending,
    isUnmuting: unmuteMutation.isPending,
    isLoading: muteMutation.isPending || unmuteMutation.isPending,
  };
}
