import { useInfiniteQuery } from '@tanstack/react-query';
import { conversationsApi } from './conversations-api';

export function useConversations(query?: string) {
  return useInfiniteQuery({
    queryKey: ['conversations', query || ''],
    queryFn: ({ pageParam }) =>
      conversationsApi.getConversations(pageParam as string | null, 50, query),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : null),
  });
}
