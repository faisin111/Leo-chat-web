import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from './conversations-api';
import { toast } from 'sonner';
import { formatApiError } from '@/shared/api/api-error';

export const useDeleteMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => conversationsApi.deleteMessage(messageId),
    onSuccess: () => {
      // Invalidate messages list to reflect the deletion
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      toast.success('Message deleted successfully');
    },
    onError: (error) => {
      toast.error(formatApiError(error, 'Failed to delete message'));
    },
  });
};
