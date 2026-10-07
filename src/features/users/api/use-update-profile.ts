import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from './users-api';
import { toast } from 'sonner';
import { useSession } from '@/features/auth';
import type { CurrentUser } from '@/features/auth';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useSession((state) => state.setUser);
  const user = useSession((state) => state.user);

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => usersApi.updateProfile(data),
    onSuccess: (updatedUser: CurrentUser) => {
      // Update global user state
      if (user) {
        setUser({ ...user, ...updatedUser });
      }
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}
