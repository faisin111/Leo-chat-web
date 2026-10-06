import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Search, UserPlus, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
// eslint-disable-next-line no-restricted-imports
import { useStartDirectMessage } from '@/features/chat/api/use-start-direct-message';
// eslint-disable-next-line no-restricted-imports
import { useSearchUsers } from '@/features/users/api/use-search-users';

export const NewChatPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const startDm = useStartDirectMessage();

  // Simple debounce logic if useDebounce hook doesn't exist
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: users, isLoading } = useSearchUsers(debouncedQuery);

  const handleStartChat = (id: string) => {
    if (!id.trim()) return;
    startDm.mutate(id);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <header className="h-16 border-b border-slate-100 flex items-center px-4 shrink-0 bg-white">
        <Button variant="ghost" size="icon" asChild className="mr-4 text-slate-500">
          <Link to="/app">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h2 className="font-semibold text-base">New Direct Message</h2>
      </header>

      <div className="p-6 shrink-0 border-b border-slate-100 bg-slate-50/50">
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-10 h-12 bg-white text-base rounded-xl border-slate-200"
              placeholder="Search by username or display name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
          {debouncedQuery ? 'Search Results' : 'Type to search users'}
        </p>

        {isLoading && debouncedQuery && (
          <div className="flex justify-center p-4">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        )}

        {!isLoading && users?.length === 0 && debouncedQuery && (
          <p className="text-sm text-slate-500 text-center py-8">
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
            color="bg-slate-100 text-slate-700"
            onClick={() => handleStartChat(user.id)}
            isPending={startDm.isPending && startDm.variables === user.id}
          />
        ))}
      </div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function UserRow({ name, handle, status, initials, color, onClick, isPending, avatarUrl }: any) {
  const isOnline = status === 'ONLINE';
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden ${color}`}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-slate-500">{handle}</p>
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
