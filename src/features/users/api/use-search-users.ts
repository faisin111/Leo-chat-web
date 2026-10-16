import { useQuery } from '@tanstack/react-query';
import { usersApi, type UserSearchItem } from './users-api';

export interface UseSearchUsersOptions {
  page?: number;
  size?: number;
  enabled?: boolean;
}

export function useSearchUsers(query: string, options?: UseSearchUsersOptions) {
  const trimmed = query.trim();
  const page = options?.page ?? 0;
  const size = options?.size ?? 20;
  const isQueryValid = trimmed.length >= 2;
  const isEnabled = options?.enabled !== undefined ? options.enabled && isQueryValid : isQueryValid;

  return useQuery<UserSearchItem[]>({
    queryKey: ['users', 'search', trimmed, page, size],
    queryFn: () => usersApi.searchUsers(trimmed, page, size),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
