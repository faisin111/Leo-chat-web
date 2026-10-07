import {
  Search,
  Users,
  Clock,
  MapPin,
  Plus,
  MessageSquare,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useState, useEffect } from 'react';
// eslint-disable-next-line no-restricted-imports
import { useSearchUsers } from '@/features/users/api/use-search-users';
// eslint-disable-next-line no-restricted-imports
import type { UserSearchItem } from '@/features/users/api/users-api';
// eslint-disable-next-line no-restricted-imports
import { useStartDirectMessage } from '@/features/chat/api/use-start-direct-message';
import { useSession } from '@/features/auth';
import { format } from 'date-fns';

export const PeoplePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserSearchItem | null>(null);

  const currentUser = useSession((s) => s.user);
  const startDm = useStartDirectMessage();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // If query is empty, maybe we search a default empty string to get some users if the API supports it,
  // or we just rely on whatever the API returns for 'ma' or ''
  const { data: users, isLoading } = useSearchUsers(debouncedQuery);

  const handleMessage = (userId: string) => {
    startDm.mutate(userId);
  };

  return (
    <div className="flex-1 flex h-[100dvh] bg-slate-50 relative overflow-hidden">
      {/* Directory Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0 hidden md:flex">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-6">People</h2>

          <Button
            variant="outline"
            asChild
            className="w-full justify-start text-primary border-primary/20 hover:bg-primary/5 mb-6 shadow-sm"
          >
            <Link to="/app/new">
              <Plus className="w-4 h-4 mr-2" /> New conversation
            </Link>
          </Button>

          <nav className="flex flex-col space-y-1 mb-8">
            <PeopleNavItem
              icon={<Users className="w-4 h-4" />}
              label="All people"
              active
              count={users?.length || 0}
            />
            <PeopleNavItem icon={<Clock className="w-4 h-4" />} label="Recent" />
            <PeopleNavItem icon={<Users className="w-4 h-4" />} label="Connections" />
            <PeopleNavItem icon={<ShieldAlert className="w-4 h-4" />} label="Blocked" />
          </nav>

          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg mt-auto">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Start a group</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Bring several people into one focused conversation.
            </p>
            <Link
              to="/app/new-group"
              className="text-xs font-bold text-primary hover:text-white transition-colors flex items-center"
            >
              Create group <span className="ml-1">→</span>
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Main List */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold">Start a conversation</h1>
              <Button variant="outline" asChild className="rounded-full bg-white shadow-sm">
                <Link to="/app/new-group">
                  <Users className="w-4 h-4 mr-2" /> Create a group
                </Link>
              </Button>
            </div>
            <p className="text-slate-500 text-sm mb-6">Find people by name, email or @username.</p>

            <div className="flex space-x-3 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  className="pl-9 h-12 bg-white rounded-xl shadow-sm border-slate-200"
                  placeholder="Search for users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500">
                {isLoading ? 'Searching...' : `${users?.length || 0} people found`}
              </span>
            </div>

            <div className="space-y-3">
              {isLoading && (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              )}

              {!isLoading && users?.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-sm">
                  No users found matching &quot;{debouncedQuery}&quot;
                </div>
              )}

              {users?.map((user) => {
                if (user.id === currentUser?.id) return null;
                const isSelected = selectedUser?.id === user.id;

                return (
                  <PeopleResult
                    key={user.id}
                    user={user}
                    selected={isSelected}
                    onClick={() => setSelectedUser(user)}
                    onMessage={() => handleMessage(user.id)}
                    isPending={startDm.isPending && startDm.variables === user.id}
                  />
                );
              })}
            </div>
          </div>

          {/* Right Preview Panel */}
          <div className="w-full lg:w-[320px] shrink-0">
            {selectedUser ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl mb-4 relative shadow-sm overflow-hidden">
                  {selectedUser.profilePictureUrl ? (
                    <img
                      src={selectedUser.profilePictureUrl}
                      alt={selectedUser.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (selectedUser.displayName || selectedUser.username)
                      .substring(0, 2)
                      .toUpperCase()
                  )}
                  {selectedUser.status === 'ONLINE' && (
                    <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></span>
                  )}
                </div>
                <h3 className="text-xl font-bold mb-1">
                  {selectedUser.displayName || selectedUser.username}
                </h3>
                <p className="text-xs text-slate-500 mb-2">@{selectedUser.username}</p>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6 ${selectedUser.status === 'ONLINE' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}
                >
                  {selectedUser.status}
                </span>

                <p className="text-sm text-slate-600 mb-8 px-4 leading-relaxed">
                  {selectedUser.bio || 'No bio provided.'}
                </p>

                <div className="w-full space-y-4 text-xs text-left mb-8">
                  {selectedUser.region && (
                    <div className="flex items-center text-slate-500">
                      <MapPin className="w-4 mr-3 text-slate-400" /> {selectedUser.region}
                    </div>
                  )}
                  {selectedUser.lastSeenAt && selectedUser.status !== 'ONLINE' && (
                    <div className="flex items-center text-slate-500">
                      <Clock className="w-4 mr-3 text-slate-400" /> Last seen{' '}
                      {format(new Date(selectedUser.lastSeenAt), 'MMM d, h:mm a')}
                    </div>
                  )}
                </div>

                <div className="w-full space-y-2 mt-auto">
                  <Button
                    onClick={() => handleMessage(selectedUser.id)}
                    disabled={startDm.isPending}
                    className="w-full rounded-xl h-10 shadow-sm text-sm"
                  >
                    {startDm.isPending && startDm.variables === selectedUser.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <MessageSquare className="w-4 h-4 mr-2" />
                    )}
                    Message
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 border-dashed sticky top-8 flex flex-col items-center text-center text-slate-400 py-24">
                <Users className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-sm font-medium">Select a user to view their profile</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PeopleNavItem({ icon, label, active = false, count }: any) {
  return (
    <button
      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors font-medium ${active ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span>{label}</span>
      </div>
      {count !== undefined && <span className="text-xs text-slate-400 font-bold">{count}</span>}
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PeopleResult({ user, selected, onClick, onMessage, isPending }: any) {
  const isOnline = user.status === 'ONLINE';
  const name = user.displayName || user.username;
  const initials = name.substring(0, 2).toUpperCase();

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      role="button"
      tabIndex={0}
      className={`flex items-center p-3 rounded-xl border-2 transition-colors cursor-pointer shadow-sm ${selected ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white hover:border-slate-300'}`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-4 relative bg-slate-100 text-slate-700 overflow-hidden shrink-0`}
      >
        {user.profilePictureUrl ? (
          <img src={user.profilePictureUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
        )}
      </div>
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center space-x-2">
          <p className="font-semibold text-sm text-slate-900 truncate">
            {name} <span className="text-slate-500 font-normal">@{user.username}</span>
          </p>
          {isOnline && (
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider shrink-0">
              ONLINE
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 truncate">{user.bio || 'Available'}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onMessage();
        }}
        disabled={isPending}
        className="rounded-full shadow-sm text-xs h-8 px-4 border-slate-200 shrink-0"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Message'}
      </Button>
    </div>
  );
}
