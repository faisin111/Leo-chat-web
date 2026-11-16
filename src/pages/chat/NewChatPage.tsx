import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { Avatar } from '@/shared/ui/avatar';
import { Search, UserPlus, ArrowLeft, Loader2, MessageSquarePlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useStartDirectMessage } from '@/features/chat';
import { useSearchUsers, type UserSearchItem } from '@/features/users';
import { AnimatePresence, motion } from 'framer-motion';

export const NewChatPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [selectedUser, setSelectedUser] = useState<UserSearchItem | null>(null);
  const startDm = useStartDirectMessage();

  // Simple debounce logic if useDebounce hook doesn't exist
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: users, isLoading } = useSearchUsers(debouncedQuery);

  const handleStartChat = () => {
    if (!selectedUser) return;
    startDm.mutate(selectedUser.id, {
      onSuccess: () => setSelectedUser(null),
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative">
      <header className="h-16 border-b border-border flex items-center px-4 shrink-0 bg-card">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="mr-4 text-muted-foreground hover:text-foreground"
        >
          <Link to="/app">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h2 className="font-semibold text-base text-foreground">New Direct Message</h2>
      </header>

      <div className="p-6 shrink-0 border-b border-border bg-card/50">
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10 h-12 bg-background text-base rounded-xl border-border"
              placeholder="Search by username or display name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          {debouncedQuery ? 'Search Results' : 'Type to search users'}
        </p>

        {isLoading && debouncedQuery && <UserRowSkeleton />}

        {!isLoading && users?.length === 0 && debouncedQuery && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No users found matching &quot;{debouncedQuery}&quot;
          </p>
        )}

        {users?.map((user) => (
          <UserRow
            key={user.id}
            name={user.displayName || user.username}
            handle={`@${user.username}`}
            status={user.status}
            avatarUrl={user.profilePictureUrl}
            initials={(user.displayName || user.username).substring(0, 2).toUpperCase()}
            color="bg-primary/10 text-primary"
            onClick={() => setSelectedUser(user)}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-card rounded-3xl shadow-2xl p-6 w-full max-w-sm pointer-events-auto overflow-hidden relative border border-border"
              >
                <button
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center mt-4">
                  <div className="relative mb-4">
                    <Avatar
                      src={selectedUser.profilePictureUrl}
                      alt={selectedUser.username}
                      className="w-20 h-20 font-bold text-2xl bg-primary/10 text-primary shadow-sm"
                      fallback={(selectedUser.displayName || selectedUser.username)
                        .substring(0, 2)
                        .toUpperCase()}
                    />
                    {selectedUser.status === 'ONLINE' && (
                      <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-card rounded-full" />
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-1">
                    {selectedUser.displayName || selectedUser.username}
                  </h3>
                  <p className="text-muted-foreground font-medium mb-6">@{selectedUser.username}</p>

                  <div className="w-full bg-muted/50 rounded-2xl p-4 mb-6 text-sm text-foreground text-left border border-border">
                    <p className="mb-2">
                      <span className="font-semibold text-foreground">Bio:</span>{' '}
                      {selectedUser.bio || 'No bio provided.'}
                    </p>
                    {selectedUser.region && (
                      <p>
                        <span className="font-semibold text-foreground">Location:</span>{' '}
                        {selectedUser.region}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="gradient"
                    onClick={handleStartChat}
                    disabled={startDm.isPending}
                    className="w-full h-12 rounded-xl text-base font-semibold gap-2"
                  >
                    {startDm.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <MessageSquarePlus className="w-5 h-5" />
                        Start Conversation
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function UserRow({ name, handle, status, initials, color, onClick, isPending, avatarUrl }: any) {
  const isOnline = status === 'ONLINE';
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar
            src={avatarUrl}
            alt={name}
            className={`w-12 h-12 font-bold text-sm ${color}`}
            fallback={initials}
          />
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-card rounded-full" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground">{handle}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        ) : (
          <UserPlus className="w-5 h-5 text-primary" />
        )}
      </Button>
    </div>
  );
}

function UserRowSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-2xl">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="space-y-2">
              <Skeleton className={`h-4 ${i % 2 === 0 ? 'w-28' : 'w-36'} rounded-md`} />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
          </div>
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}
