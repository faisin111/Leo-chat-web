import { Button } from '@/shared/ui/button';
import { Phone, Video, Info, Smile, Paperclip, Send, Loader2, UserPlus } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
// eslint-disable-next-line no-restricted-imports
import { useSendMessage } from '@/features/chat/api/use-send-message';
// eslint-disable-next-line no-restricted-imports
import { useMessages } from '@/features/chat/api/use-messages';
// eslint-disable-next-line no-restricted-imports
import { useConversations } from '@/features/chat/api/use-conversations';
import { useSession } from '@/features/auth';
import { format } from 'date-fns';
import { AddMembersModal } from './components/AddMembersModal';
import { wsService } from '@/shared/api/websocket';
import { useQueryClient } from '@tanstack/react-query';
// eslint-disable-next-line no-restricted-imports
import type { Message } from '@/features/chat/api/conversations-api';

export const ConversationPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [content, setContent] = useState('');
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, number>>({});
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);

  const sendMessage = useSendMessage(conversationId || '');
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
  }, [conversationId]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleIncomingMessage = (rawMsg: any) => {
      // Handle potential payload wrapping from different backend STOMP configurations
      const msg = rawMsg.payload || rawMsg;

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
        // Instantly show the message on screen via local state
        setLiveMessages((prev) => {
          if (
            prev.find(
              (m) =>
                m.id === msg.id || (m.clientMessageId && m.clientMessageId === msg.clientMessageId),
            )
          ) {
            return prev;
          }
          return [msg, ...prev];
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

    // 2. Explicit typing indicator topic
    const cleanupTypingSub = wsService.subscribe(
      `/topic/conversations.${conversationId}.typing`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rawMsg: any) => {
        const msg = rawMsg.payload || rawMsg;
        const uid = msg.userId || msg.senderId || 'typing';

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

    return () => {
      cleanupMessages();
      cleanupTypingSub();
    };
  }, [conversationId, queryClient, currentUser?.id]);

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
      seq: Date.now(),
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

    // Send to server
    sendMessage.mutate(payload);
  };

  const handleTyping = (val: string) => {
    setContent(val);

    if (val.trim() && conversationId) {
      wsService.publish('/app/chat.typing', { conversationId, isTyping: true });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        wsService.publish('/app/chat.typing', { conversationId, isTyping: false });
      }, 2000);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      <AddMembersModal
        isOpen={isAddMembersOpen}
        onClose={() => setIsAddMembersOpen(false)}
        conversationId={conversationId || ''}
      />
      {/* Header */}
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
            #
          </div>
          <div>
            <h2 className="font-semibold text-sm">Conversation</h2>
            <p className="text-[10px] text-slate-500">{conversationId}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isGroup && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddMembersOpen(true)}
                className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9"
                title="Add members"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9"
          >
            <Phone className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9"
          >
            <Video className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-slate-200 mx-1"></div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col-reverse gap-6 pb-4">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
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
              const name = isOwn ? currentUser?.displayName || 'You' : msg.senderId.substring(0, 8);
              const color = isOwn ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-700';
              const time = format(new Date(msg.createdAt), 'h:mm a');

              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1 ${color}`}
                  >
                    {initials}
                  </div>
                  <div
                    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}
                  >
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span className="text-xs font-semibold">{name}</span>
                      <span className="text-[10px] text-slate-400">{time}</span>
                    </div>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm ${isOwn ? 'bg-primary text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}
                    >
                      {msg.content}
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
      <div className="p-4 bg-white border-t border-slate-100">
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

        <div className="flex items-end bg-slate-50 rounded-2xl border border-slate-200 p-1 pl-4 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <textarea
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 max-h-32 text-sm focus:outline-none"
            placeholder="Write a message..."
            rows={1}
            value={content}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sendMessage.isPending}
          />
          <div className="flex items-center space-x-1 p-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-600 rounded-full h-8 w-8"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-600 rounded-full h-8 w-8"
            >
              <Smile className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              className="rounded-full h-8 w-8 bg-primary text-white hover:bg-primary/90 ml-2 shadow-sm"
              onClick={handleSend}
              disabled={!content.trim() || sendMessage.isPending}
            >
              {sendMessage.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 ml-0.5" />
              )}
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
          <strong>Return</strong> to send, <strong>Shift + Return</strong> for new line
        </p>
      </div>
    </div>
  );
};
