import { useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from './conversations-api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useStartDirectMessage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: conversationsApi.startDirectMessage,
    onSuccess: (data) => {
      // Invalidate the conversations list so the new chat shows up in the sidebar
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      // Navigate to the newly created (or existing) conversation
      navigate(`/app/c/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to start conversation');
    }
  });
}
