import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ShieldOff } from 'lucide-react';
import { aiApi } from '@/features/ai';
import { useUserById } from '@/features/users';
import { Avatar } from '@/shared/ui/avatar';
import { Skeleton } from '@/shared/ui/skeleton';

type BlockedUser = { userId: string; blockedAt?: string | null };

// The backend exposes the block list only through the GET_BLOCKED_USERS assistant action;
// there is no REST endpoint to block or unblock yet, so this page is read-only.
const useBlockedUsers = () =>
  useQuery({
    queryKey: ['blocked-users'],
    queryFn: async () => {
      const response = await aiApi.executeAction<BlockedUser[]>({ action: 'GET_BLOCKED_USERS' });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

export const BlockedUsersPage = () => {
  const { data: blocked = [], isLoading, isError } = useBlockedUsers();

  return (
    <div className="max-w-3xl w-full mx-auto p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          Blocked Users
        </h1>
        <p className="text-sm text-muted-foreground">People you have blocked.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-border">
            {[0, 1].map((i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="p-6 text-sm text-destructive">Could not load blocked users.</p>
        ) : blocked.length === 0 ? (
          <div className="p-8 flex flex-col items-center text-center gap-2">
            <ShieldOff className="w-6 h-6 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">You haven&apos;t blocked anyone</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {blocked.map((entry) => (
              <BlockedUserRow key={entry.userId} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function BlockedUserRow({ entry }: { entry: BlockedUser }) {
  const { data: user, isLoading } = useUserById(entry.userId);
  const name = user?.displayName || user?.username || 'Unknown user';
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="p-4 flex items-center space-x-4">
      <Avatar
        src={user?.profilePictureUrl}
        alt={name}
        fallback={initials}
        className="w-10 h-10 rounded-xl"
      />
      <div>
        {isLoading ? (
          <Skeleton className="h-3 w-32" />
        ) : (
          <h3 className="font-semibold text-sm text-foreground">{name}</h3>
        )}
        <p className="text-xs text-muted-foreground">
          {user?.username ? `@${user.username}` : null}
          {entry.blockedAt
            ? ` • Blocked on ${format(new Date(entry.blockedAt), 'MMM d, yyyy')}`
            : null}
        </p>
      </div>
    </div>
  );
}
