import { useState, useEffect, useMemo } from 'react';
import { AnimatedOutlet } from './AnimatedOutlet';
import { Search, PenSquare, Hash, X, Pin, BellOff, Users } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { Avatar } from '@/shared/ui/avatar';
import { useConversations, useConversationsTyping, useTypingStore } from '@/features/chat';
import { formatDistanceToNow } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';

type FilterType = 'all' | 'unread' | 'groups' | 'archived';

export default function ChatLayout() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useConversations(debouncedQuery);
  const location = useLocation();

  const allConversations = useMemo(() => data?.pages.flatMap((page) => page.items) || [], [data]);

  const filteredConversations = useMemo(() => {
    return allConversations.filter((c) => {
      if (activeFilter === 'groups') return c.type === 'GROUP';
      if (activeFilter === 'unread') return c.status === 'UNREAD';
      if (activeFilter === 'archived') return c.status === 'ARCHIVED';
      // 'all' includes active conversations by default
      return c.status !== 'ARCHIVED';
    });
  }, [allConversations, activeFilter]);

  const conversationIds = useMemo(
    () => filteredConversations.map((c) => c.id),
    [filteredConversations],
  );
  useConversationsTyping(conversationIds);

  const isConversationDetail = location.pathname.startsWith('/app/c/');

  return (
    <div className="flex h-full w-full bg-slate-50">
      {/* Messages Sidebar (Hidden on mobile if viewing a conversation) */}
      <aside
        className={`${isConversationDetail ? 'hidden md:flex' : 'flex'} w-full md:w-[340px] border-r border-slate-200 bg-white flex-col shrink-0`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Messages</h2>
              <p className="text-xs text-emerald-600 font-medium">● Online</p>
            </div>
            <Link
              to="/app/new"
              className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors shadow-xs"
              title="New direct message or group"
            >
              <PenSquare className="w-4 h-4" />
            </Link>
          </div>

          {/* Search Bar with Debounce & Clear */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9.5 pr-8 bg-slate-100/70 border-none rounded-xl h-10 text-sm focus-visible:ring-2 focus-visible:ring-primary/20"
              placeholder="Search conversations & users"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 mb-4 text-xs font-semibold overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
                activeFilter === 'unread'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setActiveFilter('groups')}
              className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
                activeFilter === 'groups'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Groups
            </button>
            <button
              onClick={() => setActiveFilter('archived')}
              className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
                activeFilter === 'archived'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Archived
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-1.5">
            {isLoading ? (
              <ConversationsListSkeleton />
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center px-4">
                <p className="text-sm font-medium">No conversations found</p>
                <p className="text-xs text-slate-400 mt-1">
                  {debouncedQuery
                    ? `No matches for "${debouncedQuery}"`
                    : activeFilter === 'archived'
                      ? 'No archived conversations'
                      : activeFilter === 'unread'
                        ? 'All caught up! No unread conversations'
                        : activeFilter === 'groups'
                          ? 'No groups yet. Click the edit icon above to create one!'
                          : 'Start a chat by clicking the pencil button above.'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const displayName =
                  conv.title || conv.targetDisplayName || conv.targetUsername || 'Unknown User';

                return (
                  <ChatItem
                    key={conv.id}
                    id={conv.id}
                    type={conv.type}
                    initials={displayName.substring(0, 2).toUpperCase()}
                    name={displayName}
                    avatarUrl={
                      conv.type === 'GROUP'
                        ? conv.avatarUrl
                        : conv.targetAvatarUrl || conv.avatarUrl
                    }
                    message={conv.type === 'GROUP' ? 'Group conversation' : 'Direct message'}
                    time={
                      conv.lastMessageAt
                        ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })
                        : 'New'
                    }
                    active={location.pathname === `/app/c/${conv.id}`}
                    color="bg-slate-100 text-slate-700"
                    isArchived={conv.status === 'ARCHIVED'}
                  />
                );
              })
            )}

            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-2.5 text-xs font-semibold text-primary hover:bg-primary/5 rounded-xl transition-colors mt-2 flex items-center justify-center cursor-pointer"
              >
                {isFetchingNextPage ? <Skeleton className="h-4 w-20 rounded-md" /> : 'Load more'}
              </button>
            )}
          </div>

          {/* Bottom Archived Bar */}
          <div className="mt-auto pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveFilter(activeFilter === 'archived' ? 'all' : 'archived')}
              className={`flex items-center justify-between text-xs font-medium w-full p-2 rounded-xl transition-colors cursor-pointer ${
                activeFilter === 'archived'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center">
                <Hash className="w-4 h-4 mr-2 text-slate-400" />
                <span>Archived conversations</span>
              </div>
              {activeFilter === 'archived' && (
                <span className="text-[10px] text-primary font-semibold">Active</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content (Hidden on mobile if viewing the list) */}
      <main
        className={`${!isConversationDetail ? 'hidden md:flex' : 'flex'} flex-1 bg-white relative flex-col min-w-0`}
      >
        <AnimatedOutlet />
      </main>
    </div>
  );
}

interface ChatItemProps {
  id: string;
  type?: string;
  initials: string;
  name: string;
  message: string;
  time: string;
  badge?: string;
  active?: boolean;
  color?: string;
  avatarUrl?: string | null;
  isPinned?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
}

function ChatItem({
  id,
  type = 'DIRECT',
  initials,
  name,
  message,
  time,
  badge,
  active = false,
  color = 'bg-slate-100 text-slate-700',
  avatarUrl,
  isPinned,
  isMuted,
  isArchived,
}: ChatItemProps) {
  const typingUsersRecord = useTypingStore((s) => s.typingByConversation[id]);
  const typingUsers = typingUsersRecord ? Object.values(typingUsersRecord) : [];
  const isTyping = typingUsers.length > 0;

  let typingText = 'typing...';
  if (type === 'GROUP' && typingUsers.length > 0) {
    const firstUser = typingUsers[0]?.username || 'Someone';
    if (typingUsers.length === 1) {
      typingText = `${firstUser} is typing...`;
    } else if (typingUsers.length === 2) {
      const secondUser = typingUsers[1]?.username || 'Someone';
      typingText = `${firstUser} & ${secondUser} are typing...`;
    } else {
      typingText = 'Several people are typing...';
    }
  }

  return (
    <Link
      to={`/app/c/${id}`}
      className={`w-full flex items-start text-left p-3 rounded-2xl transition-colors ${
        active ? 'bg-primary/5 shadow-xs' : 'hover:bg-slate-50'
      }`}
    >
      <div className="relative shrink-0 mr-3">
        <Avatar
          src={avatarUrl}
          alt={name}
          className={`w-10 h-10 text-sm font-bold ${color}`}
          fallback={
            type === 'GROUP' && !avatarUrl ? <Users className="w-5 h-5 text-slate-500" /> : initials
          }
        />
        {isTyping && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5" title="Typing...">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary border-2 border-white" />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center space-x-1.5 min-w-0 pr-1">
            <p className="font-semibold text-sm truncate text-slate-900">{name}</p>
            {isPinned && <Pin className="w-3 h-3 text-primary shrink-0 fill-primary/20" />}
            {isMuted && <BellOff className="w-3 h-3 text-slate-400 shrink-0" />}
            {isArchived && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">
                Archived
              </span>
            )}
          </div>
          <span
            className={`text-[10px] whitespace-nowrap shrink-0 ${
              isTyping
                ? 'text-primary font-bold animate-pulse'
                : active
                  ? 'text-primary font-bold'
                  : 'text-slate-400'
            }`}
          >
            {isTyping ? 'typing...' : time}
          </span>
        </div>

        {isTyping ? (
          <div className="flex items-center space-x-1.5 text-xs text-primary font-medium truncate">
            <span className="flex space-x-0.5 items-center shrink-0">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
            </span>
            <span className="truncate italic">{typingText}</span>
          </div>
        ) : (
          <p
            className={`text-xs truncate ${active ? 'text-slate-700 font-medium' : 'text-slate-500'}`}
          >
            {message}
          </p>
        )}
      </div>

      {badge && (
        <div className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0 mt-3">
          {badge}
        </div>
      )}
    </Link>
  );
}

function ConversationsListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center p-3 rounded-2xl space-x-3">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className={`h-3.5 ${i % 2 === 0 ? 'w-24' : 'w-32'} rounded-md`} />
              <Skeleton className="h-2.5 w-8 rounded-md" />
            </div>
            <Skeleton
              className={`h-3 ${i % 3 === 0 ? 'w-40' : i % 2 === 0 ? 'w-28' : 'w-48'} rounded-md`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
