import { useInfiniteQuery } from '@tanstack/react-query';
import { conversationsApi } from './conversations-api';

export function useMessages(conversationId: string, query?: string) {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId, query || ''],
    queryFn: ({ pageParam }) =>
      conversationsApi.getMessages(conversationId, pageParam as string | null, 25, null, query),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : null),
    enabled: !!conversationId,
    retry: (count, err: unknown) => {
      const status = (err as { status?: number })?.status;
      if (status && [400, 401, 403, 404, 409, 422].includes(status)) {
        return false;
      }
      return count < 1;
    },
  });
}
