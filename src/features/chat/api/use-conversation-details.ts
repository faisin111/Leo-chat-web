import { useQuery } from '@tanstack/react-query';
import { conversationsApi, type Conversation } from './conversations-api';

export function useConversationDetails(conversationId?: string | null) {
  return useQuery<Conversation>({
    queryKey: ['conversation', conversationId],
    queryFn: () => conversationsApi.getConversation(conversationId!),
    enabled: !!conversationId,
  });
}
