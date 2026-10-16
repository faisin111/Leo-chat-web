import { useQuery } from '@tanstack/react-query';
import { conversationsApi, type ConversationMember } from './conversations-api';

export function useConversationMembers(conversationId?: string | null) {
  return useQuery<ConversationMember[]>({
    queryKey: ['conversation-members', conversationId],
    queryFn: () => conversationsApi.getMembers(conversationId!),
    enabled: !!conversationId,
  });
}
