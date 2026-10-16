import { useInfiniteQuery } from '@tanstack/react-query';
import { conversationsApi } from './conversations-api';

export function useMessages(conversationId: string, query?: string) {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId, query || ''],
    queryFn: ({ pageParam }) =>
      conversationsApi.getMessages(conversationId, pageParam as string | null, 50, null, query),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : null),
    enabled: !!conversationId,
  });
}
