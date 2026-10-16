import { Button } from '@/shared/ui/button';
import {
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  Send,
  Loader2,
  UserPlus,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import type { KeyboardEvent } from 'react';
// eslint-disable-next-line no-restricted-imports
import { useSendMessage } from '@/features/chat/api/use-send-message';
// eslint-disable-next-line no-restricted-imports
import { useMessages } from '@/features/chat/api/use-messages';
// eslint-disable-next-line no-restricted-imports
import { useDeleteMessage } from '@/features/chat/api/use-delete-message';
// eslint-disable-next-line no-restricted-imports
import { useConversations } from '@/features/chat/api/use-conversations';
import { useSession } from '@/features/auth';
import { format } from 'date-fns';
import { AddMembersModal } from './components/AddMembersModal';
import { UserProfileSidebar } from './components/UserProfileSidebar';
// eslint-disable-next-line no-restricted-imports
import { useUserById } from '@/features/users/api/use-user-by-id';
// eslint-disable-next-line no-restricted-imports
import { useSearchUsers } from '@/features/users/api/use-search-users';
import { wsService } from '@/shared/api/websocket';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
// eslint-disable-next-line no-restricted-imports
import type { Message } from '@/features/chat/api/conversations-api';

export const ConversationPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [content, setContent] = useState('');
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, number>>({});
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sendMessage = useSendMessage(conversationId || '');
  const deleteMessage = useDeleteMessage(conversationId || '');
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useMessages(
    conversationId || '',
  );
  const currentUser = useSession((s) => s.user);
  const queryClient = useQueryClient();
  const { data: conversationsData } = useConversations();

  const conversation = conversationsData?.pages
    .flatMap((p) => p.items)
    .find((c) => c.id === conversationId);
  const isGroup = conversation?.type === 'GROUP';

  // Clear live messages when changing conversations
  useEffect(() => {
    setLiveMessages([]);
    setIsProfileSidebarOpen(false);
  }, [conversationId]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleIncomingMessage = (rawMsg: any) => {
      // Handle potential payload wrapping from different backend STOMP configurations
      const rawObj = rawMsg.payload || rawMsg;
      let msg = rawObj;
      if (typeof rawObj === 'string') {
        try {
          msg = JSON.parse(rawObj);
        } catch {
          msg = { content: rawObj };
        }
      }

      if (!msg) return;

      // INTERCEPT TYPING EVENTS: If backend broadcasts typing on the same topic
      if (msg.type === 'TYPING' || msg.isTyping || msg.action === 'TYPING') {
        const uid = msg.userId || msg.senderId;
        if (uid && uid !== currentUser?.id) {
          setTypingUsers((prev) => ({ ...prev, [uid]: Date.now() }));
        }
        return; // Stop processing, this is not a text message
      }

      const targetId = msg.conversationId || msg.groupId || msg.chatId;

      if (!targetId || targetId === conversationId) {
        const normalizedMsg: Message = {
          ...msg,
          id: msg.id || msg.messageId || crypto.randomUUID(),
          conversationId: targetId || conversationId || '',
          content: msg.content || msg.text || msg.message || '',
          senderId: msg.senderId || msg.sender_id || msg.userId || '',
          createdAt:
            msg.createdAt ||
            msg.timestamp ||
            msg.created_at ||
            msg.sentAt ||
            new Date().toISOString(),
          type: msg.type || 'TEXT',
          clientMessageId: msg.clientMessageId || null,
          replyToId: msg.replyToId || null,
          editedAt: msg.editedAt || null,
          deletedAt: msg.deletedAt || null,
          seq: typeof msg.seq === 'number' && msg.seq < 1000000000 ? msg.seq : 0,
        };

        // Instantly show the message on screen via local state
        setLiveMessages((prev) => {
          const index = prev.findIndex(
            (m) =>
              m.id === normalizedMsg.id ||
              (normalizedMsg.clientMessageId &&
                m.clientMessageId === normalizedMsg.clientMessageId),
          );
          if (index !== -1) {
            // Upgrade optimistic message with real server id and seq
            const next = [...prev];
            next[index] = normalizedMsg;
            return next;
          }
          return [normalizedMsg, ...prev];
        });
      }

      // Always update the sidebar list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      // Keep React Query cache loosely in sync
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      // Update global unread badge
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    };

    // 1. Explicitly subscribe to this specific conversation's topic
    const cleanupMessages = wsService.subscribe(
      `/topic/conversations.${conversationId}`,
      handleIncomingMessage,
    );

    // 2. Also listen for direct messages arriving on user queue
    const cleanupUserQueue = wsService.addMessageListener(handleIncomingMessage);

    // 3. Explicit typing indicator topic
    const cleanupTypingSub = wsService.subscribe(
      `/topic/conversations.${conversationId}.typing`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rawMsg: any) => {
        const msg = rawMsg.payload || rawMsg;
        const uid = msg.userId || msg.senderId || 'typing';

        // Ignore typing events from oneself
        if (
          uid === currentUser?.id ||
          (currentUser?.username && msg.username === currentUser.username)
        ) {
          return;
        }

        if (msg.isTyping) {
          setTypingUsers((prev) => ({ ...prev, [uid]: Date.now() }));
        } else {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[uid];
            return next;
          });
        }
      },
    );

    // 4. Listen for delivery / save acks on /user/queue/acks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanupAcks = wsService.addAckListener((ack: any) => {
      const ackConvId = ack?.conversationId || ack?.chatId;
      if (!ackConvId || ackConvId === conversationId) {
        if (ack?.id && ack?.clientMessageId) {
          handleIncomingMessage(ack);
        }
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      }
    });

    // 5. Listen for errors on /user/queue/errors
    const cleanupErrors = wsService.addErrorListener((err) => {
      toast.error(err.message || 'Action failed');
    });

    // 6. Listen for notifications on /user/queue/notifications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanupNotifications = wsService.addNotificationListener((notif: any) => {
      if (notif?.message) {
        toast.info(notif.message);
      }
    });

    return () => {
      cleanupMessages();
      cleanupUserQueue();
      cleanupTypingSub();
      cleanupAcks();
      cleanupErrors();
      cleanupNotifications();
    };
  }, [conversationId, queryClient, currentUser?.id, currentUser?.username]);

  // Auto-clear stale typing indicators after 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        let changed = false;
        const next: Record<string, number> = {};
        for (const [uid, timestamp] of Object.entries(prev)) {
          if (now - timestamp < 3500) {
            next[uid] = timestamp;
          } else {
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Combine live and historical messages, deduplicating carefully
  const historicalMessages = data?.pages.flatMap((p) => p.items) || [];
  const allMessagesMap = new Map<string, Message>();

  // 1. Add historical messages first (these are real DB messages and should take precedence)
  historicalMessages.forEach((m) => {
    // ALWAYS prioritize clientMessageId for deduplication if it exists!
    const key = m.clientMessageId || m.id || Math.random().toString();
    allMessagesMap.set(key, m);
  });

  // 2. Add live messages only if they aren't already represented by a historical DB message
  liveMessages.forEach((m) => {
    const key = m.clientMessageId || m.id || Math.random().toString();
    // Also do a fallback check for exact content + sender just in case backend drops clientMessageId
    const isDuplicateFallback = Array.from(allMessagesMap.values()).some(
      (existing) =>
        existing.senderId === m.senderId &&
        existing.content === m.content &&
        Math.abs(new Date(existing.createdAt).getTime() - new Date(m.createdAt).getTime()) < 5000,
    );

    if (!allMessagesMap.has(key) && !isDuplicateFallback) {
      allMessagesMap.set(key, m);
    }
  });

  // Sort descending by date so the newest is at the start of the array (bottom of the flex-col-reverse container)
  const allMessages = Array.from(allMessagesMap.values()).sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : Date.now();
    return timeB - timeA;
  });

  // Derive other user's ID for 1-on-1 direct conversation
  const directKeyUserId = useMemo(() => {
    if (!conversation?.directKey) return undefined;
    const uuids = conversation.directKey.match(
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g,
    );
    if (!uuids) return undefined;
    return uuids.find((id) => id.toLowerCase() !== currentUser?.id?.toLowerCase());
  }, [conversation?.directKey, currentUser?.id]);

  const targetUsername = conversation?.targetUsername;
  const { data: searchResults } = useSearchUsers(targetUsername || '');
  const usernameMatchedUser = targetUsername
    ? searchResults?.find((u) => u.username?.toLowerCase() === targetUsername.toLowerCase())
    : undefined;

  const otherUserId = !isGroup
    ? conversation?.targetUserId ||
      directKeyUserId ||
      usernameMatchedUser?.id ||
      allMessages.find((m) => m.senderId && m.senderId !== currentUser?.id)?.senderId ||
      (conversation?.createdBy && conversation.createdBy !== currentUser?.id
        ? conversation.createdBy
        : undefined)
    : undefined;

  const { data: targetUserProfile, isLoading: isTargetUserLoading } = useUserById(otherUserId);

  const headerName = isGroup
    ? conversation?.title || 'Group Conversation'
    : targetUserProfile?.displayName ||
      targetUserProfile?.username ||
      conversation?.targetDisplayName ||
      conversation?.targetUsername ||
      'Direct Message';

  const headerAvatar = isGroup
    ? conversation?.avatarUrl
    : targetUserProfile?.profilePictureUrl ||
      conversation?.targetAvatarUrl ||
      conversation?.avatarUrl;

  const headerInitials = (headerName || 'U').substring(0, 2).toUpperCase();

  const isUserTyping = otherUserId && typingUsers[otherUserId];

  const headerSubtitle = isGroup
    ? 'Group Conversation'
    : isUserTyping
      ? 'typing...'
      : targetUserProfile?.username
        ? `@${targetUserProfile.username}${targetUserProfile.region ? ` · ${targetUserProfile.region}` : ''}`
        : conversation?.targetUsername
          ? `@${conversation.targetUsername}`
          : 'Click to view profile';

  const handleSend = () => {
    if (!content.trim() || !conversationId) return;

    const optimisticId = crypto.randomUUID();
    const payload = {
      content: content.trim(),
      type: 'TEXT',
      clientMessageId: optimisticId,
    };

    // Optimistically push to UI instantly!
    const optimisticMsg: Message = {
      id: optimisticId,
      conversationId,
      senderId: currentUser?.id || '',
      seq: 0,
      clientMessageId: optimisticId,
      type: 'TEXT',
      content: content.trim(),
      replyToId: null,
      createdAt: new Date().toISOString(),
      editedAt: null,
      deletedAt: null,
    };

    setLiveMessages((prev) => [optimisticMsg, ...prev]);
    setContent('');

    // 1. Send STOMP frame to /app/chat.send with JSON payload
    const sentViaWs = wsService.sendChatMessage({
      conversationId,
      clientMessageId: optimisticId,
      content: content.trim(),
      type: 'TEXT',
    });

    // 2. Fallback to REST API if WebSocket is not yet connected
    if (!sentViaWs) {
      sendMessage.mutate(payload);
    }
  };

  // Mark messages as read up to the latest sequence
  const latestSeq = useMemo(() => {
    let max = 0;
    for (const msg of allMessages) {
      if (typeof msg.seq === 'number' && msg.seq > max && msg.seq < 1000000000) {
        max = msg.seq;
      }
    }
    return max;
  }, [allMessages]);

  const lastReportedReadSeq = useRef<number>(0);

  useEffect(() => {
    if (
      conversationId &&
      latestSeq > 0 &&
      latestSeq < 1000000000 &&
      latestSeq > lastReportedReadSeq.current
    ) {
      lastReportedReadSeq.current = latestSeq;
      wsService.sendChatRead(conversationId, latestSeq);
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    }
  }, [conversationId, latestSeq, queryClient]);

  const handleTyping = (val: string) => {
    setContent(val);

    if (val.trim() && conversationId) {
      wsService.sendChatTyping(conversationId, true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        wsService.sendChatTyping(conversationId, false);
      }, 2000);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setDeletingId(messageId);
    deleteMessage.mutate(messageId, {
      onSuccess: () => {
        setLiveMessages((prev) => prev.filter((m) => m.id !== messageId));
      },
      onSettled: () => {
        setDeletingId(null);
      },
    });
  };

  return (
    <div className="flex-1 flex h-full bg-white relative overflow-hidden">
      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white">
        <AddMembersModal
          isOpen={isAddMembersOpen}
          onClose={() => setIsAddMembersOpen(false)}
          conversationId={conversationId || ''}
        />
        {/* Header */}
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-3 sm:px-6 shrink-0 bg-white">
          <div className="flex items-center min-w-0 space-x-1 sm:space-x-3">
            {/* Mobile back to conversation list button */}
            <Link
              to="/app"
              className="md:hidden flex items-center justify-center w-10 h-10 -ml-1 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
              aria-label="Back to conversations"
              title="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <button
              type="button"
              onClick={() => setIsProfileSidebarOpen((prev) => !prev)}
              className="flex items-center space-x-2.5 sm:space-x-3 text-left rounded-2xl p-1 -ml-1 transition-colors hover:bg-slate-50 cursor-pointer group/header min-w-0"
              title="View details"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden relative border border-slate-100">
                {isGroup ? (
                  '#'
                ) : isTargetUserLoading && !headerAvatar ? (
                  <Skeleton className="w-full h-full rounded-full" />
                ) : headerAvatar ? (
                  <img src={headerAvatar} alt={headerName} className="w-full h-full object-cover" />
                ) : (
                  headerInitials
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <h2 className="font-semibold text-sm text-slate-900 group-hover/header:text-primary transition-colors truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs md:max-w-sm">
                    {isTargetUserLoading && !headerName ? (
                      <Skeleton className="h-4 w-28 rounded-md" />
                    ) : (
                      headerName
                    )}
                  </h2>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs md:max-w-sm">
                  {headerSubtitle}
                </p>
              </div>
            </button>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            {isGroup && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAddMembersOpen(true)}
                  className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9 min-h-[36px] min-w-[36px]"
                  title="Add members"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
                <div className="hidden sm:block w-px h-4 bg-slate-200 mx-1"></div>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex text-slate-400 hover:text-slate-600 rounded-full h-9 w-9"
              title="Start call"
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex text-slate-400 hover:text-slate-600 rounded-full h-9 w-9"
              title="Start video"
            >
              <Video className="w-4 h-4" />
            </Button>
            <div className="hidden sm:block w-px h-4 bg-slate-200 mx-1"></div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsProfileSidebarOpen((prev) => !prev)}
              className={`text-slate-400 hover:text-slate-600 rounded-full h-9 w-9 min-h-[36px] min-w-[36px] cursor-pointer ${
                isProfileSidebarOpen ? 'bg-slate-100 text-primary' : ''
              }`}
              title="View details"
            >
              <Info className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col-reverse gap-4 sm:gap-6 pb-4">
          {isLoading ? (
            <ChatMessagesSkeleton />
          ) : allMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs">Send a message to start the conversation!</p>
            </div>
          ) : (
            <>
              {allMessages.map((msg) => {
                const isOwn = msg.senderId === currentUser?.id;
                // Very simple initials generation for now
                const initials = isOwn ? (currentUser?.displayName?.[0] || 'U').toUpperCase() : 'U';
                const name = isOwn
                  ? currentUser?.displayName || 'You'
                  : msg.senderId.substring(0, 8);
                const color = isOwn ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-700';
                const msgDate = msg.createdAt ? new Date(msg.createdAt) : new Date();
                const time = isNaN(msgDate.getTime())
                  ? format(new Date(), 'h:mm a')
                  : format(msgDate, 'h:mm a');

                return (
                  <div
                    key={msg.id}
                    className={`group flex items-start space-x-2.5 sm:space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1 ${color}`}
                    >
                      {initials}
                    </div>
                    <div
                      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[75%]`}
                    >
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className="text-xs font-semibold">{name}</span>
                        <span className="text-[10px] text-slate-400">{time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isOwn && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            disabled={deletingId === msg.id}
                            className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer shrink-0"
                            title="Delete message"
                          >
                            {deletingId === msg.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        <div
                          className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-sm break-words [overflow-wrap:anywhere] ${isOwn ? 'bg-primary text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Load more is now at the END of the DOM, which appears at the visually TOP due to flex-col-reverse */}
              {hasNextPage && (
                <div className="text-center pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="text-xs text-primary"
                  >
                    {isFetchingNextPage ? 'Loading older...' : 'Load older messages'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          {/* Typing Indicator */}
          {Object.keys(typingUsers).length > 0 && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 mb-2 px-2">
              <div className="flex space-x-1">
                <span
                  className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                ></span>
                <span
                  className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                ></span>
              </div>
              <span>
                {Object.keys(typingUsers).length === 1
                  ? 'Someone is typing...'
                  : 'Several people are typing...'}
              </span>
            </div>
          )}

          <div className="flex items-end bg-slate-50 rounded-2xl border border-slate-200 p-1 pl-3 sm:pl-4 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <textarea
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2.5 sm:py-3 max-h-32 text-base md:text-sm focus:outline-none"
              placeholder="Write a message..."
              rows={1}
              value={content}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sendMessage.isPending}
            />
            <div className="flex items-center space-x-1 p-1 sm:p-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-slate-600 rounded-full h-8 w-8 min-h-[36px] min-w-[36px]"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-slate-600 rounded-full h-8 w-8 min-h-[36px] min-w-[36px]"
              >
                <Smile className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                className="rounded-full h-9 w-9 min-h-[36px] min-w-[36px] bg-primary text-white hover:bg-primary/90 ml-1 sm:ml-2 shadow-sm"
                onClick={handleSend}
                disabled={!content.trim() || sendMessage.isPending}
              >
                {sendMessage.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 ml-0.5" />
                )}
              </Button>
            </div>
          </div>
          <p className="hidden sm:block text-[10px] text-slate-400 text-center mt-2 font-medium">
            <strong>Return</strong> to send, <strong>Shift + Return</strong> for new line
          </p>
        </div>
      </div>

      {/* Side View Layout Panel for User Details */}
      {isProfileSidebarOpen && (
        <>
          {/* Mobile & Tablet Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden animate-in fade-in duration-200"
            onClick={() => setIsProfileSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-80 lg:relative lg:inset-auto lg:w-96 lg:z-auto h-full shrink-0">
            <UserProfileSidebar
              onClose={() => setIsProfileSidebarOpen(false)}
              userId={otherUserId}
              fallbackName={headerName}
              fallbackUsername={conversation?.targetUsername || usernameMatchedUser?.username}
              fallbackAvatar={headerAvatar}
              isGroup={isGroup}
            />
          </div>
        </>
      )}
    </div>
  );
};

function ChatMessagesSkeleton() {
  return (
    <div className="flex flex-col-reverse gap-6 w-full py-2">
      {/* 1. Recent own message (at visual bottom) */}
      <div className="flex items-start flex-row-reverse space-x-reverse space-x-3 max-w-[75%] self-end">
        <Skeleton className="w-8 h-8 rounded-full shrink-0 mt-1" />
        <div className="flex flex-col items-end space-y-1.5">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-2.5 w-10 rounded-md" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>
          <Skeleton className="h-10 w-52 rounded-2xl rounded-tr-sm bg-primary/20" />
        </div>
      </div>

      {/* 2. Other user message */}
      <div className="flex items-start space-x-3 max-w-[75%]">
        <Skeleton className="w-8 h-8 rounded-full shrink-0 mt-1" />
        <div className="flex flex-col items-start space-y-1.5">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-2.5 w-12 rounded-md" />
          </div>
          <Skeleton className="h-16 w-72 rounded-2xl rounded-tl-sm" />
        </div>
      </div>

      {/* 3. Own message */}
      <div className="flex items-start flex-row-reverse space-x-reverse space-x-3 max-w-[75%] self-end">
        <Skeleton className="w-8 h-8 rounded-full shrink-0 mt-1" />
        <div className="flex flex-col items-end space-y-1.5">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-2.5 w-10 rounded-md" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>
          <Skeleton className="h-14 w-60 rounded-2xl rounded-tr-sm bg-primary/20" />
        </div>
      </div>

      {/* 4. Other user short message */}
      <div className="flex items-start space-x-3 max-w-[75%]">
        <Skeleton className="w-8 h-8 rounded-full shrink-0 mt-1" />
        <div className="flex flex-col items-start space-y-1.5">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-2.5 w-10 rounded-md" />
          </div>
          <Skeleton className="h-10 w-44 rounded-2xl rounded-tl-sm" />
        </div>
      </div>

      {/* 5. Other user longer message */}
      <div className="flex items-start space-x-3 max-w-[75%]">
        <Skeleton className="w-8 h-8 rounded-full shrink-0 mt-1" />
        <div className="flex flex-col items-start space-y-1.5">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-2.5 w-10 rounded-md" />
          </div>
          <Skeleton className="h-20 w-80 rounded-2xl rounded-tl-sm" />
        </div>
      </div>
    </div>
  );
}
