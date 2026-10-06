import { useQuery } from '@tanstack/react-query';
import { usersApi } from './users-api';

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => usersApi.searchUsers(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
