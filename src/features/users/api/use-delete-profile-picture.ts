import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from './users-api';
import { useSession } from '@/features/auth';
import { showApiError } from '@/shared/api/api-error';
import { toast } from 'sonner';

export function useDeleteProfilePicture() {
  const queryClient = useQueryClient();
  const user = useSession((state) => state.user);
  const setUser = useSession((state) => state.setUser);

  return useMutation({
    mutationFn: usersApi.deleteProfilePicture,
    onSuccess: (response) => {
      if (user) setUser({ ...user, profilePictureUrl: null });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      if (user?.id) queryClient.invalidateQueries({ queryKey: ['user', user.id] });
      toast.success(response.message || 'Profile picture removed');
    },
    onError: (error: Error) => showApiError(error, 'Failed to remove profile picture'),
  });
}
