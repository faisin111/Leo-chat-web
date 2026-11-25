import { useInfiniteQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/query-keys';
import { notificationsApi } from './notifications-api';

export function useNotifications(unreadOnly = false, pageSize = 30) {
  return useInfiniteQuery({
    queryKey: qk.notifications.list(unreadOnly),
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      notificationsApi.list({
        page: pageParam,
        size: pageSize,
        unreadOnly,
      }),
    getNextPageParam: (lastPage) => (!lastPage.last ? lastPage.number + 1 : undefined),
    staleTime: 15_000,
  });
}
