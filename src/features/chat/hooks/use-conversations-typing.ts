import { useEffect, useRef } from 'react';
import { wsService } from '@/shared/api/websocket';
import { useSession } from '@/features/auth';
import { useTypingStore } from '../store/typing.store';

/**
 * Subscribes to STOMP typing indicator topics for the given list of conversation IDs.
 * Automatically handles topic subscription lifecycle, updates the central typing store,
 * and maintains a periodic cleanup interval for stale indicators.
 */
export function useConversationsTyping(conversationIds: string[]) {
  const currentUserId = useSession((s) => s.user?.id);
  const currentUsername = useSession((s) => s.user?.username);
  const setTyping = useTypingStore((s) => s.setTyping);
  const clearStale = useTypingStore((s) => s.clearStale);

  // Maintain active topic subscriptions: conversationId -> unsubscribe function
  const activeSubsRef = useRef<Map<string, () => void>>(new Map());

  const idsKey = conversationIds.filter(Boolean).sort().join(',');

  useEffect(() => {
    const activeSubs = activeSubsRef.current;
    const targetIds = new Set(conversationIds.filter(Boolean));

    // 1. Unsubscribe and remove IDs no longer in list
    for (const [id, unsub] of activeSubs.entries()) {
      if (!targetIds.has(id)) {
        unsub();
        activeSubs.delete(id);
      }
    }

    // 2. Subscribe to new conversation topics
    targetIds.forEach((convId) => {
      if (activeSubs.has(convId)) return;

      const unsub = wsService.subscribe(
        `/topic/conversations.${convId}.typing`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (rawMsg: any) => {
          const msg = rawMsg?.payload || rawMsg;
          if (!msg) return;

          const uid = msg.userId || msg.senderId || 'typing';

          // Ignore typing events from the current authenticated user
          if (uid === currentUserId || (currentUsername && msg.username === currentUsername)) {
            return;
          }

          setTyping(convId, {
            userId: uid,
            username: msg.username || 'Someone',
            isTyping: !!msg.isTyping,
          });
        },
      );

      activeSubs.set(convId, unsub);
    });
  }, [idsKey, conversationIds, currentUserId, currentUsername, setTyping]);

  // Cleanup on unmount
  useEffect(() => {
    const activeSubs = activeSubsRef.current;
    return () => {
      activeSubs.forEach((unsub) => unsub());
      activeSubs.clear();
    };
  }, []);

  // Periodic interval to clear stale typing indicators (> 3.5s)
  useEffect(() => {
    const interval = setInterval(() => {
      clearStale(3500);
    }, 1000);
    return () => clearInterval(interval);
  }, [clearStale]);
}
