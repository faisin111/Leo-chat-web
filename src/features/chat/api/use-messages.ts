import { useInfiniteQuery } from '@tanstack/react-query';
import { conversationsApi } from './conversations-api';

export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam }) => conversationsApi.getMessages(conversationId, pageParam as string | null),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : null),
    enabled: !!conversationId,
  });
}
