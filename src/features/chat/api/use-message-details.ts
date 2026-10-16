import { useQuery } from '@tanstack/react-query';
import { conversationsApi, type Message } from './conversations-api';

export function useMessageDetails(messageId?: string | null) {
  return useQuery<Message>({
    queryKey: ['message', messageId],
    queryFn: () => conversationsApi.getMessage(messageId!),
    enabled: !!messageId,
  });
}
