import { AnimatedOutlet } from './AnimatedOutlet';
import { Search, PenSquare, Hash, Loader2 } from 'lucide-react';
import { Input } from '@/shared/ui/input';
// eslint-disable-next-line no-restricted-imports
import { useConversations } from '@/features/chat/api/use-conversations';
import { formatDistanceToNow } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';

export default function ChatLayout() {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useConversations();
  const location = useLocation();

  const conversations = data?.pages.flatMap((page) => page.items) || [];

  return (
    <div className="flex h-full w-full bg-slate-50">
      {/* Messages Sidebar */}
      <aside className="w-[340px] border-r border-slate-200 bg-white flex flex-col shrink-0">
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
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
              </div>
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
                className="w-full py-3 text-xs font-semibold text-primary hover:bg-primary/5 rounded-xl transition-colors mt-2"
              >
                {isFetchingNextPage ? 'Loading...' : 'Load more'}
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

      <main className="flex-1 bg-white relative flex flex-col min-w-0">
        <AnimatedOutlet />
      </main>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChatItem({
  id,
  initials,
  name,
  message,
  time,
  badge,
  active = false,
  color = 'bg-slate-100 text-slate-700',
  avatarUrl,
}: any) {
  return (
    <Link
      to={`/app/c/${id}`}
      className={`w-full flex items-start text-left p-3 rounded-2xl transition-colors ${active ? 'bg-primary/5' : 'hover:bg-slate-50'}`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mr-3 overflow-hidden ${color}`}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <p className="font-semibold text-sm truncate pr-2">{name}</p>
          <span
            className={`text-[10px] whitespace-nowrap ${active ? 'text-primary font-bold' : 'text-slate-400'}`}
          >
            {time}
          </span>
        </div>
        <p
          className={`text-xs truncate ${active ? 'text-slate-700 font-medium' : 'text-slate-500'}`}
        >
          {message}
        </p>
      </div>
      {badge && (
        <div className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0 mt-3">
          {badge}
        </div>
      )}
    </Link>
  );
}
