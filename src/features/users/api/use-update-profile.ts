import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type ProfileUpdateBody } from './users-api';
import { toast } from 'sonner';
import { useSession } from '@/features/auth';
import { showApiError } from '@/shared/api/api-error';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useSession((state) => state.setUser);
  const user = useSession((state) => state.user);

  return useMutation({
    mutationFn: (data: ProfileUpdateBody) => usersApi.updateProfile(data),
    onSuccess: async (_, variables) => {
      try {
        const freshUser = await usersApi.getMe();
        setUser({
          id: freshUser.id,
          username: freshUser.username,
          email: freshUser.email || (user?.email ?? ''),
          displayName: freshUser.displayName,
          role: freshUser.role || (user?.role ?? 'ROLE_USER'),
          profilePictureUrl: freshUser.profilePictureUrl,
          phoneNumber: freshUser.phoneNumber,
          bio: freshUser.bio,
          age: freshUser.age,
          region: freshUser.region,
          isEmailVerified: freshUser.isEmailVerified ?? freshUser.emailVerified,
        });
      } catch {
        if (user) {
          setUser({ ...user, ...variables });
        }
      }
      queryClient.invalidateQueries({ queryKey: ['me'] });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      }
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      showApiError(error, 'Failed to update profile');
    },
  });
}
