import { useQuery } from '@tanstack/react-query';
import { usersApi, type UserProfile } from './users-api';
import { useSession } from '@/features/auth';
import { useEffect } from 'react';

export function useMe() {
  const setUser = useSession((s) => s.setUser);

  const query = useQuery<UserProfile>({
    queryKey: ['me'],
    queryFn: usersApi.getMe,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (query.data) {
      setUser({
        id: query.data.id,
        username: query.data.username,
        email: query.data.email || '',
        displayName: query.data.displayName,
        role: query.data.role || 'ROLE_USER',
        profilePictureUrl: query.data.profilePictureUrl,
        phoneNumber: query.data.phoneNumber,
        bio: query.data.bio,
        age: query.data.age,
        region: query.data.region,
        isEmailVerified: query.data.isEmailVerified ?? query.data.emailVerified,
      });
    }
  }, [query.data, setUser]);

  return query;
}
