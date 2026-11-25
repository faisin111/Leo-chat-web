import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { wsService } from '@/shared/api/websocket';
import { qk } from '@/shared/api/query-keys';

/** Keeps the Notification Center list and unread badge synchronized with real-time events. */
export function useNotificationsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const syncNotifications = () => {
      queryClient.invalidateQueries({ queryKey: qk.notifications.all });
    };

    const unsubNotif = wsService.addNotificationListener(syncNotifications);
    const unsubCall = wsService.addCallSignalListener((signal) => {
      if (signal.action === 'INVITE') {
        syncNotifications();
      }
    });

    return () => {
      unsubNotif();
      unsubCall();
    };
  }, [queryClient]);
}
