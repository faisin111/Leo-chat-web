import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Heart,
  Loader2,
  MessageSquare,
  PhoneIncoming,
  RefreshCw,
  Trash2,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  useNotifications,
  useNotificationUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  type AppNotification,
  type NotificationType,
} from '@/features/notifications';

type ReadFilter = 'all' | 'unread';
type TypeFilter = 'ALL' | 'NEW_MESSAGE' | 'MESSAGE_REACTION' | 'INCOMING_CALL';

function safeFormatRelative(dateStr?: string | null): string {
  if (!dateStr) return 'Just now';
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return 'Just now';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Just now';
  }
}

function safeFormatExact(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '';
    return format(date, 'MMM d, yyyy · h:mm a');
  } catch {
    return '';
  }
}

function getNotificationMeta(type: NotificationType) {
  switch (type) {
    case 'INCOMING_CALL':
      return {
        label: 'Call',
        icon: PhoneIncoming,
        iconBoxClass:
          'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
        pillClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
      };
    case 'MESSAGE_REACTION':
      return {
        label: 'Reaction',
        icon: Heart,
        iconBoxClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25',
        pillClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20',
      };
    case 'NEW_MESSAGE':
    default:
      return {
        label: 'Message',
        icon: MessageSquare,
        iconBoxClass: 'bg-primary/15 text-primary border-primary/25',
        pillClass: 'bg-primary/10 text-primary border-primary/20',
      };
  }
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');

  const unreadOnly = readFilter === 'unread';

  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useNotifications(unreadOnly);
  const { data: unreadData } = useNotificationUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = unreadData?.unreadCount ?? 0;

  const allItems = useMemo(() => data?.pages.flatMap((page) => page.content) ?? [], [data]);
  const totalElements = data?.pages[0]?.totalElements ?? allItems.length;

  const visibleItems = useMemo(() => {
    if (typeFilter === 'ALL') return allItems;
    return allItems.filter((item) => item.type === typeFilter);
  }, [allItems, typeFilter]);

  const handleOpenNotification = (item: AppNotification) => {
    if (!item.read) {
      markRead.mutate(item.id);
    }
    if (item.conversationId) {
      navigate(`/app/c/${item.conversationId}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 flex flex-col">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border/70">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/25 text-primary flex items-center justify-center shrink-0 shadow-xs">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
                {unreadCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/25">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {unreadCount} unread
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    All caught up
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Messages, reactions, and incoming call alerts synchronized across web and mobile.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching && !isFetchingNextPage}
              className="rounded-xl gap-1.5 cursor-pointer"
              title="Refresh notifications"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isFetching && !isFetchingNextPage ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={unreadCount === 0 || markAllRead.isPending}
              className="rounded-xl gap-1.5 cursor-pointer shadow-xs"
            >
              {markAllRead.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5" />
              )}
              <span>Mark all read</span>
            </Button>
          </div>
        </header>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4">
          <div
            role="tablist"
            aria-label="Notification read status filter"
            className="inline-flex items-center p-1 rounded-xl bg-muted/70 border border-border/60 w-fit"
          >
            <button
              type="button"
              role="tab"
              aria-selected={readFilter === 'all'}
              onClick={() => setReadFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                readFilter === 'all'
                  ? 'bg-background text-foreground shadow-xs border border-border/50'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={readFilter === 'unread'}
              onClick={() => setReadFilter('unread')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                readFilter === 'unread'
                  ? 'bg-background text-foreground shadow-xs border border-border/50'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            {(
              [
                { id: 'ALL', label: 'All types' },
                { id: 'NEW_MESSAGE', label: 'Messages' },
                { id: 'MESSAGE_REACTION', label: 'Reactions' },
                { id: 'INCOMING_CALL', label: 'Calls' },
              ] as const
            ).map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setTypeFilter(chip.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer border ${
                  typeFilter === chip.id
                    ? 'bg-primary/15 text-primary border-primary/30'
                    : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 flex flex-col gap-2.5 pb-6">
          {isLoading ? (
            <NotificationsSkeleton />
          ) : visibleItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-border bg-card/40">
              <div className="w-14 h-14 rounded-2xl bg-muted/80 text-muted-foreground flex items-center justify-center mb-4">
                <BellOff className="w-6 h-6" />
              </div>
              <h2 className="text-base font-semibold text-foreground">
                {unreadOnly
                  ? 'No unread notifications'
                  : typeFilter !== 'ALL'
                    ? 'No matching notifications'
                    : 'No notifications yet'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {unreadOnly
                  ? 'You have read all of your recent alerts.'
                  : 'New messages, reactions, and incoming calls will appear here automatically.'}
              </p>
              {(unreadOnly || typeFilter !== 'ALL') && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReadFilter('all');
                    setTypeFilter('ALL');
                  }}
                  className="mt-4 rounded-xl cursor-pointer"
                >
                  Show all notifications
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2.5">
                {visibleItems.map((item) => {
                  const meta = getNotificationMeta(item.type);
                  const Icon = meta.icon;
                  const exactTime = safeFormatExact(item.createdAt);

                  return (
                    <div
                      key={item.id}
                      className={`group relative flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 ${
                        item.read
                          ? 'bg-card/80 border-border/70 hover:border-border hover:bg-card'
                          : 'bg-primary/[0.04] dark:bg-primary/[0.08] border-primary/25 hover:border-primary/40 shadow-xs'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenNotification(item)}
                        className="flex-1 min-w-0 flex items-start gap-3.5 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
                      >
                        <div
                          className={`relative w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${meta.iconBoxClass}`}
                        >
                          <Icon className="w-4 h-4" />
                          {!item.read && (
                            <span
                              aria-label="Unread notification"
                              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background"
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className={`text-sm truncate ${
                                item.read
                                  ? 'font-medium text-foreground'
                                  : 'font-semibold text-foreground'
                              }`}
                            >
                              {item.title}
                            </p>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${meta.pillClass}`}
                            >
                              {meta.label}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 break-words">
                            {item.body}
                          </p>

                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/90">
                            <span title={exactTime}>{safeFormatRelative(item.createdAt)}</span>
                            {item.conversationId && (
                              <span className="inline-flex items-center gap-0.5 text-primary font-medium opacity-80 group-hover:opacity-100">
                                Open chat
                                <ArrowUpRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Row actions */}
                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        {!item.read && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => markRead.mutate(item.id)}
                            disabled={markRead.isPending}
                            className="w-8 h-8 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                            title="Mark as read"
                            aria-label="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteNotification.mutate(item.id)}
                          disabled={deleteNotification.isPending}
                          className="w-8 h-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Delete notification"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasNextPage && (
                <div className="pt-2 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="rounded-xl px-6 cursor-pointer"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading…
                      </>
                    ) : (
                      `Load older (${allItems.length} of ${totalElements})`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-start gap-3.5 p-4 rounded-2xl border border-border/60 bg-card/60"
        >
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
