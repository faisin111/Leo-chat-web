import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { showApiError } from '@/shared/api/api-error';
import { conversationsApi } from './conversations-api';

export function useArchiveConversation() {
  const queryClient = useQueryClient();

  const archiveMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => conversationsApi.archiveConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['conversation-members', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', id] });
      toast.success('Conversation archived');
    },
    onError: (error) => {
      showApiError(error, 'Failed to archive conversation');
    },
  });

  const unarchiveMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => conversationsApi.unarchiveConversation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['conversation-members', id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', id] });
      toast.success('Conversation unarchived');
    },
    onError: (error) => {
      showApiError(error, 'Failed to unarchive conversation');
    },
  });

  return {
    archive: archiveMutation.mutate,
    unarchive: unarchiveMutation.mutate,
    isArchiving: archiveMutation.isPending,
    isUnarchiving: unarchiveMutation.isPending,
    isLoading: archiveMutation.isPending || unarchiveMutation.isPending,
  };
}
