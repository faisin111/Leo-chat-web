import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Users,
  MapPin,
  Plus,
  MessageSquare,
  ShieldAlert,
  Loader2,
  X,
  Sparkles,
  Phone,
  LayoutGrid,
  List as ListIcon,
  ShieldCheck,
  UserCheck,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { Avatar } from '@/shared/ui/avatar';
import { useSearchUsers, usePresence, useUserById, type UserSearchItem } from '@/features/users';
import { useStartDirectMessage } from '@/features/chat';
import { useSession } from '@/features/auth';

type FilterTab = 'ALL' | 'ONLINE' | 'VERIFIED' | 'WITH_BIO';
type ViewMode = 'GRID' | 'LIST';

export const PeoplePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('GRID');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const currentUser = useSession((s) => s.user);
  const startDm = useStartDirectMessage();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isQueryValid = debouncedQuery.length >= 2;
  const {
    data: rawUsers,
    isLoading,
    isFetching,
  } = useSearchUsers(debouncedQuery, {
    enabled: isQueryValid,
  });

  // Extract IDs for presence tracking
  const userIds = useMemo(() => {
    return (rawUsers || []).map((u) => u.id);
  }, [rawUsers]);

  const { isOnline, getLastSeenText } = usePresence(userIds);

  // Inspector user profile query
  const { data: selectedUserProfile, isLoading: isSelectedLoading } = useUserById(selectedUserId);

  // Filter users based on activeTab
  const filteredUsers = useMemo(() => {
    if (!rawUsers) return [];
    return rawUsers.filter((u) => {
      if (u.id === currentUser?.id) return false;
      if (activeTab === 'ONLINE') return isOnline(u.id);
      if (activeTab === 'VERIFIED') return Boolean(u.status === 'ACTIVE');
      if (activeTab === 'WITH_BIO') return Boolean(u.bio && u.bio.trim().length > 0);
      return true;
    });
  }, [rawUsers, currentUser?.id, activeTab, isOnline]);

  const handleMessage = (userId: string) => {
    startDm.mutate(userId);
  };

  return (
    <div className="flex-1 flex h-[100dvh] bg-background relative overflow-hidden">
      {/* Directory Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0 hidden md:flex">
        <div className="p-5 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-foreground">People Hub</h2>
            </div>
          </div>

          <Button
            variant="outline"
            asChild
            className="w-full justify-start text-primary border-primary/20 hover:bg-primary/5 mb-6 shadow-xs rounded-xl"
          >
            <Link to="/app/new">
              <Plus className="w-4 h-4 mr-2" /> Start conversation
            </Link>
          </Button>

          <nav className="flex flex-col space-y-1 mb-8">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'ALL'
                  ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4" />
                <span>All Members</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                {rawUsers?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ONLINE')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'ONLINE'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Online</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('VERIFIED')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'VERIFIED'
                  ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-4 h-4" />
                <span>Active Accounts</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('WITH_BIO')}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'WITH_BIO'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="w-4 h-4" />
                <span>With Bio</span>
              </div>
            </button>
          </nav>

          <div className="bg-gradient-to-br from-card to-muted border border-border rounded-2xl p-5 text-foreground shadow-sm mt-auto">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-semibold text-sm">Group Chats</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Bring teammates and friends together in collaborative group channels.
            </p>
            <Button
              asChild
              size="sm"
              variant="gradient"
              className="w-full rounded-xl shadow-xs text-xs font-semibold"
            >
              <Link to="/app/new-group">Create Group Channel</Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
          {/* Main User List / Grid */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  User Directory
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Search, discover, and connect with people across LeoChat.
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center bg-card p-1 rounded-xl border border-border shadow-xs">
                  <button
                    onClick={() => setViewMode('GRID')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      viewMode === 'GRID'
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('LIST')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      viewMode === 'LIST'
                        ? 'bg-muted text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title="List view"
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-xl shadow-xs border-border bg-card"
                >
                  <Link to="/app/new-group">
                    <Users className="w-3.5 h-3.5 mr-1.5 text-primary" />
                    New Group
                  </Link>
                </Button>
              </div>
            </div>

            {/* Search Input Card */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-xs mb-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-10 pr-9 h-11 bg-background rounded-xl border-border text-sm transition-all"
                  placeholder="Search members by username or display name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Status & Results Summary Bar */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  {isLoading || isFetching ? (
                    <Skeleton className="h-4 w-28 rounded-md inline-block" />
                  ) : (
                    `${filteredUsers.length} member${filteredUsers.length === 1 ? '' : 's'} found`
                  )}
                </span>
                {isFetching && !isLoading && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                )}
              </div>

              {!isQueryValid && (
                <span className="text-xs text-amber-500 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Enter at least 2 characters to search
                </span>
              )}
            </div>

            {/* Results Grid / List */}
            {isLoading ? (
              <PeopleDirectorySkeleton viewMode={viewMode} />
            ) : !isQueryValid ? (
              <div className="bg-card rounded-2xl p-12 border border-border text-center shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-1">
                  Type 2 or more characters to search
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-6">
                  Search across registered users by their handle or display name.
                </p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-card rounded-2xl p-12 border border-border text-center shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-1">No members found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                  No accounts matched your search for &quot;{debouncedQuery}&quot;. Try a different
                  name or search tag.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="rounded-xl"
                >
                  Clear Search
                </Button>
              </div>
            ) : viewMode === 'GRID' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredUsers.map((user) => {
                  const online = isOnline(user.id);
                  const lastSeen = getLastSeenText(user.id);
                  const isSelected = selectedUserId === user.id;

                  return (
                    <UserGridCard
                      key={user.id}
                      user={user}
                      online={online}
                      lastSeenText={lastSeen}
                      isSelected={isSelected}
                      onSelect={() => setSelectedUserId(user.id)}
                      onMessage={() => handleMessage(user.id)}
                      isPending={startDm.isPending && startDm.variables === user.id}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border shadow-xs divide-y divide-border overflow-hidden">
                {filteredUsers.map((user) => {
                  const online = isOnline(user.id);
                  const lastSeen = getLastSeenText(user.id);
                  const isSelected = selectedUserId === user.id;

                  return (
                    <UserListRow
                      key={user.id}
                      user={user}
                      online={online}
                      lastSeenText={lastSeen}
                      isSelected={isSelected}
                      onSelect={() => setSelectedUserId(user.id)}
                      onMessage={() => handleMessage(user.id)}
                      isPending={startDm.isPending && startDm.variables === user.id}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Inspector Drawer / Preview Panel */}
          <div className="w-full lg:w-[320px] shrink-0">
            {selectedUserId ? (
              <UserInspectorPanel
                userId={selectedUserId}
                profile={selectedUserProfile}
                isLoading={isSelectedLoading}
                online={isOnline(selectedUserId)}
                lastSeenText={getLastSeenText(selectedUserId)}
                onClose={() => setSelectedUserId(null)}
                onMessage={() => handleMessage(selectedUserId)}
                isMessaging={startDm.isPending && startDm.variables === selectedUserId}
              />
            ) : (
              <div className="bg-card rounded-2xl p-8 border border-border border-dashed sticky top-8 flex flex-col items-center text-center text-muted-foreground py-20 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mb-3">
                  <UserCheck className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">Select a Member</h3>
                <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                  Click any profile card to view their full bio, location, presence, and start a
                  chat.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

// User Card (Grid Mode)
interface UserGridCardProps {
  user: UserSearchItem;
  online: boolean;
  lastSeenText: string;
  isSelected: boolean;
  onSelect: () => void;
  onMessage: () => void;
  isPending: boolean;
}

function UserGridCard({
  user,
  online,
  lastSeenText,
  isSelected,
  onSelect,
  onMessage,
  isPending,
}: UserGridCardProps) {
  const name = user.displayName || user.username;
  const initials = name.substring(0, 2).toUpperCase();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group relative bg-card rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-primary ring-2 ring-primary/20 shadow-md'
          : 'border-border shadow-xs hover:border-primary/40 hover:shadow-sm'
      }`}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          {/* Avatar with Live Online Indicator */}
          <div className="relative">
            <Avatar
              src={user.profilePictureUrl}
              alt={name}
              className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-base border border-border"
              fallback={initials}
            />
            {online ? (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-card rounded-full ring-2 ring-emerald-500/20" />
            ) : (
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-muted-foreground/40 border-2 border-card rounded-full" />
            )}
          </div>

          {/* Presence Pill */}
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              online
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {lastSeenText}
          </span>
        </div>

        {/* User Identity */}
        <div className="mb-2">
          <h3 className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-xs text-muted-foreground font-mono">@{user.username}</p>
        </div>

        {/* Bio */}
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
          {user.bio || <span className="italic">No bio</span>}
        </p>
      </div>

      {/* Meta Footer & Message Action */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          {user.region && (
            <span className="flex items-center gap-0.5 truncate max-w-[100px]">
              <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
              {user.region}
            </span>
          )}
          {user.age != null && user.age > 0 && <span>· {user.age} yrs</span>}
        </div>

        <Button
          size="sm"
          variant="gradient"
          onClick={(e) => {
            e.stopPropagation();
            onMessage();
          }}
          disabled={isPending}
          className="rounded-xl shadow-xs text-xs h-8 px-3 shrink-0"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
          ) : (
            <MessageSquare className="w-3.5 h-3.5 mr-1" />
          )}
          Message
        </Button>
      </div>
    </div>
  );
}

// User List Row (List Mode)
function UserListRow({
  user,
  online,
  lastSeenText,
  isSelected,
  onSelect,
  onMessage,
  isPending,
}: UserGridCardProps) {
  const name = user.displayName || user.username;
  const initials = name.substring(0, 2).toUpperCase();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`p-4 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
        isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="relative shrink-0">
          <Avatar
            src={user.profilePictureUrl}
            alt={name}
            className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-sm border border-border"
            fallback={initials}
          />
          {online ? (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full" />
          ) : (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-muted-foreground/40 border-2 border-card rounded-full" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-foreground truncate">{name}</h4>
            <span className="text-xs text-muted-foreground font-mono">@{user.username}</span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.2 rounded-full hidden sm:inline-block ${
                online
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {lastSeenText}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {user.bio || <span className="italic">No bio</span>}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onMessage();
        }}
        disabled={isPending}
        className="rounded-xl shadow-xs text-xs h-8 px-3 shrink-0"
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
        ) : (
          <MessageSquare className="w-3.5 h-3.5 mr-1 text-primary" />
        )}
        Chat
      </Button>
    </div>
  );
}

// User Inspector Panel (Right Drawer)
interface UserInspectorPanelProps {
  userId: string;
  profile?: {
    id: string;
    username: string;
    displayName?: string;
    email?: string;
    role?: string;
    profilePictureUrl?: string | null;
    phoneNumber?: string | null;
    bio?: string | null;
    age?: number | null;
    region?: string | null;
    isEmailVerified?: boolean;
  };
  isLoading: boolean;
  online: boolean;
  lastSeenText: string;
  onClose: () => void;
  onMessage: () => void;
  isMessaging: boolean;
}

function UserInspectorPanel({
  profile,
  isLoading,
  online,
  lastSeenText,
  onClose,
  onMessage,
  isMessaging,
}: UserInspectorPanelProps) {
  if (isLoading || !profile) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border shadow-xs space-y-4 sticky top-8 animate-pulse">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>
        <div className="flex flex-col items-center text-center space-y-2 py-4">
          <Skeleton className="w-20 h-20 rounded-2xl" />
          <Skeleton className="h-5 w-32 rounded-md" />
          <Skeleton className="h-3.5 w-24 rounded-md" />
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    );
  }

  const name = profile.displayName || profile.username;
  const initials = name.substring(0, 2).toUpperCase();
  const isAdmin = profile.role === 'ADMIN' || profile.role === 'ROLE_ADMIN';

  return (
    <div className="bg-card rounded-2xl p-6 border border-border shadow-xs sticky top-8 flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Profile Inspector
        </span>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Header Avatar */}
      <div className="flex flex-col items-center text-center pb-6 border-b border-border">
        <div className="relative mb-3">
          <Avatar
            src={profile.profilePictureUrl}
            alt={name}
            className="w-20 h-20 rounded-2xl bg-primary/10 text-primary font-bold text-2xl border-2 border-border shadow-xs"
            fallback={initials}
          />
          {online ? (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-card rounded-full ring-2 ring-emerald-500/20" />
          ) : (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-muted-foreground/40 border-2 border-card rounded-full" />
          )}
        </div>

        <h3 className="font-bold text-foreground text-base mb-0.5">{name}</h3>
        <p className="text-xs text-muted-foreground font-mono mb-2.5">@{profile.username}</p>

        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              isAdmin
                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {isAdmin ? 'ADMIN' : 'MEMBER'}
          </span>

          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              online
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {lastSeenText}
          </span>
        </div>
      </div>

      {/* Biography */}
      <div className="py-4 border-b border-border">
        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
          About
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {profile.bio || 'This user has not written a bio yet.'}
        </p>
      </div>

      {/* Particulars Grid */}
      <div className="py-4 border-b border-border space-y-2.5 text-xs">
        {profile.region && (
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Region
            </span>
            <span className="font-medium text-foreground">{profile.region}</span>
          </div>
        )}

        {profile.age != null && profile.age > 0 && (
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Age
            </span>
            <span className="font-medium text-foreground">{profile.age} years old</span>
          </div>
        )}

        {profile.phoneNumber && (
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Phone
            </span>
            <span className="font-medium text-foreground">{profile.phoneNumber}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Email
          </span>
          <span
            className={`font-medium ${
              profile.isEmailVerified
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-muted-foreground'
            }`}
          >
            {profile.isEmailVerified ? 'Verified' : 'Standard'}
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-4">
        <Button
          variant="gradient"
          onClick={onMessage}
          disabled={isMessaging}
          className="w-full rounded-xl shadow-xs h-10 font-semibold"
        >
          {isMessaging ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <MessageSquare className="w-4 h-4 mr-2" />
          )}
          Send Direct Message
        </Button>
      </div>
    </div>
  );
}

// Shimmer Skeleton for People directory
function PeopleDirectorySkeleton({ viewMode }: { viewMode: ViewMode }) {
  if (viewMode === 'GRID') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-2xl p-5 border border-border shadow-xs space-y-4 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
            <Skeleton className="h-8 w-full rounded-md" />
            <div className="pt-3 border-t border-border flex justify-between items-center">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs divide-y divide-border overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-3 w-48 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-xl shrink-0" />
        </div>
      ))}
    </div>
  );
}
