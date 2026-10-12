import { useQuery } from '@tanstack/react-query';
import { usersApi, type UserProfile } from './users-api';

export const useUserById = (userId?: string | null) => {
  return useQuery<UserProfile>({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getUserById(userId!),
    enabled: Boolean(userId),
  });
};
