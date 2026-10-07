import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
// eslint-disable-next-line no-restricted-imports
import { conversationsApi } from './conversations-api';

type CreateGroupData = {
  title: string;
  memberIds: string[];
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreateGroupData) => conversationsApi.createGroupMessage(data),
    onSuccess: (data) => {
      // Invalidate the conversations list so the new group appears
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // Navigate to the newly created group conversation
      navigate(`/app/c/${data.id}`);
      toast.success('Group created successfully');
    },
    onError: (error) => {
      console.error('Failed to create group:', error);
      toast.error('Failed to create group');
    },
  });
};
