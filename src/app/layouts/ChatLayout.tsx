import { useMemo } from 'react';
import { AnimatedOutlet } from './AnimatedOutlet';
import { Search, PenSquare, Hash } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { useConversations, useConversationsTyping, useTypingStore } from '@/features/chat';
import { formatDistanceToNow } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';

export default function ChatLayout() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useConversations();
  const location = useLocation();

  const conversations = useMemo(() => data?.pages.flatMap((page) => page.items) || [], [data]);
  const conversationIds = useMemo(() => conversations.map((c) => c.id), [conversations]);
  useConversationsTyping(conversationIds);

  const isConversationDetail = location.pathname.startsWith('/app/c/');

  return (
    <div className="flex h-full w-full bg-slate-50">
      {/* Messages Sidebar (Hidden on mobile if viewing a conversation) */}
      <aside
        className={`${isConversationDetail ? 'hidden md:flex' : 'flex'} w-full md:w-[340px] border-r border-slate-200 bg-white flex-col shrink-0`}
      >
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Messages</h2>
              <p className="text-xs text-green-600 font-medium">● Online</p>
            </div>
            <Link
              to="/app/new"
              className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <PenSquare className="w-4 h-4" />
            </Link>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              className="pl-9 bg-slate-100/50 border-none rounded-full h-10"
              placeholder="Search conversations"
            />
          </div>

          <div className="flex items-center space-x-2 mb-6 text-xs font-semibold">
            <button className="px-4 py-1.5 rounded-full bg-slate-900 text-white">All</button>
            <button className="px-4 py-1.5 rounded-full text-slate-500 hover:bg-slate-100">
              Unread
            </button>
            <button className="px-4 py-1.5 rounded-full text-slate-500 hover:bg-slate-100">
              Groups
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-2">
            {isLoading ? (
              <ConversationsListSkeleton />
            ) : conversations.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No conversations found.</p>
            ) : (
              conversations.map((conv) => {
                const displayName =
                  conv.title || conv.targetDisplayName || conv.targetUsername || 'Unknown User';

                return (
                  <ChatItem
                    key={conv.id}
                    id={conv.id}
                    type={conv.type}
                    initials={displayName.substring(0, 2).toUpperCase()}
                    name={displayName}
                    avatarUrl={conv.avatarUrl || conv.targetAvatarUrl}
                    message={conv.type === 'GROUP' ? 'Group conversation' : 'Direct message'}
                    time={
                      conv.lastMessageAt
                        ? formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })
                        : 'New'
                    }
                    active={location.pathname === `/app/c/${conv.id}`}
                    color="bg-slate-100 text-slate-700"
                  />
                );
              })
            )}

            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full py-2.5 text-xs font-semibold text-primary hover:bg-primary/5 rounded-xl transition-colors mt-2 flex items-center justify-center"
              >
                {isFetchingNextPage ? <Skeleton className="h-4 w-20 rounded-md" /> : 'Load more'}
              </button>
            )}
          </div>

          <div className="mt-2 pt-4 border-t border-slate-100">
            <button className="flex items-center text-xs text-slate-500 hover:text-slate-900 font-medium w-full">
              <Hash className="w-4 h-4 mr-2" />
              Archived conversations
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
      className={`w-full flex items-start text-left p-3 rounded-2xl transition-colors ${active ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
    >
      <div className="relative shrink-0 mr-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden ${color}`}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>
        {isTyping && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5" title="Typing...">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary border-2 border-white" />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="font-semibold text-sm truncate pr-2">{name}</p>
          <span
            className={`text-[10px] whitespace-nowrap ${
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
