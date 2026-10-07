import { useQuery } from '@tanstack/react-query';
import { conversationsApi } from './conversations-api';

export function useUnreadCount() {
  return useQuery({
    queryKey: ['unreadCount'],
    queryFn: conversationsApi.getUnreadCount,
    staleTime: 60000,
  });
}
