import { useQuery } from '@tanstack/react-query';
import { qk } from '@/shared/api/query-keys';
import { useSession } from '@/features/auth';
import { notificationsApi } from './notifications-api';

export function useNotificationUnreadCount() {
  const accessToken = useSession((s) => s.accessToken);

  return useQuery({
    queryKey: qk.notifications.unreadCount,
    queryFn: notificationsApi.getUnreadCount,
    enabled: Boolean(accessToken),
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}
