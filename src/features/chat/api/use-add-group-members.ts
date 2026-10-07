import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
// eslint-disable-next-line no-restricted-imports
import { conversationsApi } from './conversations-api';

type AddGroupMembersData = {
  conversationId: string;
  memberIds: string[];
};

export const useAddGroupMembers = () => {
  return useMutation({
    mutationFn: ({ conversationId, memberIds }: AddGroupMembersData) =>
      conversationsApi.addGroupMembers(conversationId, memberIds),
    onSuccess: () => {
      toast.success('Members added successfully');
      // Optionally invalidate queries related to members, but conversation doesn't change much
    },
    onError: (error) => {
      console.error('Failed to add members:', error);
      toast.error('Failed to add members');
    },
  });
};
