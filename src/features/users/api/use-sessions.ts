import { useQuery } from '@tanstack/react-query';
// eslint-disable-next-line no-restricted-imports
import { usersApi } from './users-api';

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => usersApi.getSessions(),
  });
};
