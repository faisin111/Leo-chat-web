import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatedOutlet } from './AnimatedOutlet';
import { Search, PenSquare, Hash, X, Pin, BellOff, Users, PhoneCall, Trash2 } from 'lucide-react';
import { WebQrNavIcon } from '@/pages/qr';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { Avatar } from '@/shared/ui/avatar';
import {
  useConversations,
  useConversationsTyping,
  useTypingStore,
  formatLastMessagePreview,
  type LastMessagePreview,
} from '@/features/chat';
import { useSession } from '@/features/auth';
import { wsService } from '@/shared/api/websocket';
import { formatDistanceToNow } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';
import { useRealtimeStatus } from '@/shared/api/use-realtime-status';

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
  const queryClient = useQueryClient();
  const currentUserId = useSession((s) => s.user?.id);
  const isRealtimeConnected = useRealtimeStatus();

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

  // Refresh sidebar lastMessage & timestamps whenever any visible conversation receives a realtime event
  const allConversationIdsKey = useMemo(
    () =>
      allConversations
        .map((c) => c.id)
        .filter(Boolean)
        .sort()
        .join(','),
    [allConversations],
  );

  useEffect(() => {
    if (!allConversationIdsKey) return;
    const unsubs = allConversationIdsKey.split(',').map((convId) =>
      wsService.subscribe(`/topic/conversations.${convId}`, () => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      }),
    );
    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [allConversationIdsKey, queryClient]);

  const isConversationDetail = location.pathname.startsWith('/app/c/');

  return (
    <div className="flex h-full w-full bg-background">
      {/* Messages Sidebar (Hidden on mobile if viewing a conversation) */}
      <aside
        className={`${
          isConversationDetail ? 'hidden md:flex' : 'flex'
        } w-full md:w-[340px] border-r border-border bg-card flex-col shrink-0`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Messages</h2>
              <p
                className={`text-xs font-medium flex items-center gap-1.5 mt-0.5 ${
                  isRealtimeConnected
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                <span
                  className={`inline-flex rounded-full h-2 w-2 ${
                    isRealtimeConnected ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                {isRealtimeConnected ? 'Connected' : 'Connecting…'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Link
                to="/app/qr"
                className="w-9 h-9 rounded-xl bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs"
                title="Web QR Code & Connect"
              >
                <WebQrNavIcon className="w-4 h-4" />
              </Link>
              <Link
                to="/app/new"
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary border border-primary/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs"
                title="New direct message or group"
              >
                <PenSquare className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Search Bar with Debounce & Clear */}
          <div className="relative mb-3.5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="!pl-10 !pr-8 pl-10 pr-8 bg-muted/60 dark:bg-muted/40 border-border/70 rounded-xl h-10 text-sm placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
              style={{ paddingLeft: '2.6rem', paddingRight: '2.25rem' }}
              placeholder="Search conversations & users"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 mb-3.5 text-xs font-semibold overflow-x-auto pb-1 hide-scrollbar">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'groups', label: 'Groups' },
                { id: 'archived', label: 'Archived' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer shrink-0 active:scale-95 ${
                  activeFilter === filter.id
                    ? 'bg-gradient-to-r from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] text-primary-foreground shadow-sm shadow-primary/25 font-bold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto pr-1 pb-4 space-y-1.5">
            {isLoading ? (
              <ConversationsListSkeleton />
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center px-4">
                <p className="text-sm font-semibold text-foreground">No conversations found</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
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
                const preview = formatLastMessagePreview(conv, currentUserId);
                const lastTimestamp = conv.lastMessage?.createdAt || conv.lastMessageAt;

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
                    preview={preview}
                    time={
                      lastTimestamp
                        ? formatDistanceToNow(new Date(lastTimestamp), { addSuffix: true })
                        : 'New'
                    }
                    active={location.pathname === `/app/c/${conv.id}`}
                    isArchived={conv.status === 'ARCHIVED'}
                  />
                );
              })
            )}

            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-2.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-xl transition-colors mt-2 flex items-center justify-center cursor-pointer active:scale-98"
              >
                {isFetchingNextPage ? <Skeleton className="h-4 w-20 rounded-md" /> : 'Load more'}
              </button>
            )}
          </div>

          {/* Bottom Archived Bar */}
          <div className="mt-auto pt-3 border-t border-border">
            <button
              onClick={() => setActiveFilter(activeFilter === 'archived' ? 'all' : 'archived')}
              className={`flex items-center justify-between text-xs font-medium w-full p-2 rounded-xl transition-all cursor-pointer active:scale-98 ${
                activeFilter === 'archived'
                  ? 'bg-primary/10 text-primary font-bold border border-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <div className="flex items-center">
                <Hash className="w-4 h-4 mr-2 text-muted-foreground" />
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
        className={`${
          !isConversationDetail ? 'hidden md:flex' : 'flex'
        } flex-1 bg-background relative flex-col min-w-0`}
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
  preview: LastMessagePreview;
  time: string;
  badge?: string;
  active?: boolean;
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
  preview,
  time,
  badge,
  active = false,
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
      className={`w-full flex items-start text-left p-3 rounded-2xl transition-all duration-200 active:scale-[0.99] ${
        active
          ? 'bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 shadow-xs'
          : 'hover:bg-muted/60 border border-transparent'
      }`}
    >
      <div className="relative shrink-0 mr-3">
        <Avatar
          src={avatarUrl}
          alt={name}
          className="w-10 h-10 text-sm font-bold bg-muted text-foreground border border-border/60"
          fallback={
            type === 'GROUP' && !avatarUrl ? (
              <Users className="w-5 h-5 text-muted-foreground" />
            ) : (
              initials
            )
          }
        />
        {isTyping && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5" title="Typing...">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary border-2 border-background" />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center space-x-1.5 min-w-0 pr-1">
            <p className="font-semibold text-sm truncate text-foreground">{name}</p>
            {isPinned && <Pin className="w-3 h-3 text-primary shrink-0 fill-primary/20" />}
            {isMuted && <BellOff className="w-3 h-3 text-muted-foreground shrink-0" />}
            {isArchived && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground shrink-0">
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
                  : 'text-muted-foreground'
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
            className={`text-xs truncate flex items-center gap-1 ${
              preview.isDeleted ? 'italic opacity-75' : ''
            } ${active ? 'text-foreground/90 font-medium' : 'text-muted-foreground'}`}
          >
            {preview.isDeleted && <Trash2 className="w-3 h-3 shrink-0 opacity-70" />}
            {preview.isCall && <PhoneCall className="w-3 h-3 shrink-0 text-primary" />}
            <span className="truncate">{preview.text}</span>
          </p>
        )}
      </div>

      {badge && (
        <div className="ml-2 w-5 h-5 rounded-full bg-gradient-to-r from-primary to-[hsl(var(--primary-gradient-to,var(--primary)))] text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0 mt-3 shadow-xs">
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
