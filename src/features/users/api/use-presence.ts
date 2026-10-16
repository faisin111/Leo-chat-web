import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usersApi, type PresenceItem } from './users-api';

export function usePresence(userIds: (string | undefined | null)[]) {
  const cleanIds = useMemo(() => {
    const set = new Set<string>();
    userIds.forEach((id) => {
      if (id && id.trim().length > 0) set.add(id.trim());
    });
    return Array.from(set).sort();
  }, [userIds]);

  const query = useQuery({
    queryKey: ['users', 'presence', cleanIds.join(',')],
    queryFn: () => usersApi.getPresence(cleanIds),
    enabled: cleanIds.length > 0,
    refetchInterval: 15000, // Poll presence every 15s
    staleTime: 10000,
  });

  const presenceMap = useMemo(() => {
    const map = new Map<string, PresenceItem>();
    query.data?.forEach((item) => {
      if (item.userId) map.set(item.userId, item);
      if (item.id) map.set(item.id, item);
    });
    return map;
  }, [query.data]);

  const getPresence = (userId?: string | null): PresenceItem | undefined => {
    if (!userId) return undefined;
    return presenceMap.get(userId);
  };

  const isOnline = (userId?: string | null): boolean => {
    if (!userId) return false;
    const p = presenceMap.get(userId);
    if (!p) return false;
    if (p.status !== 'ACTIVE') return false;
    if (!p.lastSeenAt) return false;
    const diffMs = Date.now() - new Date(p.lastSeenAt).getTime();
    return diffMs >= 0 && diffMs < 5 * 60 * 1000; // active in last 5m
  };

  const getLastSeenText = (userId?: string | null): string => {
    if (!userId) return 'Offline';
    const p = presenceMap.get(userId);
    if (!p) return 'Offline';
    if (isOnline(userId)) return 'Active now';
    if (!p.lastSeenAt) return 'Offline';

    const date = new Date(p.lastSeenAt);
    if (isNaN(date.getTime())) return 'Offline';
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMin < 60) return `Active ${Math.max(1, diffMin)}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `Active ${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `Active ${diffDays}d ago`;
  };

  return {
    ...query,
    presenceMap,
    getPresence,
    isOnline,
    getLastSeenText,
  };
}
