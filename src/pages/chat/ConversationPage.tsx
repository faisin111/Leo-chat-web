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
  MoreVertical,
  Pin,
  Bell,
  BellOff,
  Archive,
  Edit3,
  Users,
  Search,
  CornerUpLeft,
  Pencil,
  Check,
  CheckCheck,
  X,
  FileText,
  ExternalLink,
  HardDrive,
  UploadCloud,
  Image as ImageIcon,
  Mic,
} from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Skeleton } from '@/shared/ui/skeleton';
import { Avatar } from '@/shared/ui/avatar';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import type { KeyboardEvent, DragEvent, ChangeEvent, ClipboardEvent } from 'react';
import {
  useSendMessage,
  useMessages,
  useDeleteMessage,
  useEditMessage,
  useMessageReactions,
  useConversations,
  useConversationDetails,
  useConversationMembers,
  useMuteConversation,
  usePinConversation,
  useArchiveConversation,
  useTypingStore,
} from '@/features/chat';
import type { Message, MessageType } from '@/features/chat';
import { useSession } from '@/features/auth';
import { format } from 'date-fns';
import { AddMembersModal } from './components/AddMembersModal';
import { EditGroupModal } from './components/EditGroupModal';
import { AttachmentModal } from './components/AttachmentModal';
import { UserProfileSidebar } from './components/UserProfileSidebar';
import { VoiceMessagePlayer } from './components/VoiceMessagePlayer';
import { VoiceRecorderBar } from './components/VoiceRecorderBar';
import { mediaApi } from '@/features/media';
import { showApiError } from '@/shared/api/api-error';
import { useUserById, useSearchUsers } from '@/features/users';
import { wsService } from '@/shared/api/websocket';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const QUICK_REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export const ConversationPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [content, setContent] = useState('');
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [pendingAttachmentFile, setPendingAttachmentFile] = useState<File | null>(null);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isWindowDragOver, setIsWindowDragOver] = useState(false);
  const [isHeaderMenuOpen, setIsHeaderMenuOpen] = useState(false);
  const [isProfileSidebarOpen, setIsProfileSidebarOpen] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [isVoiceUploading, setIsVoiceUploading] = useState(false);

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  // In-chat search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Reply and Edit state
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Image preview modal state
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Local reaction state: messageId -> emoji -> userIds[]
  const [reactionsState, setReactionsState] = useState<Record<string, Record<string, string[]>>>(
    {},
  );

  const typingUsersRecord = useTypingStore((s) =>
    conversationId ? s.typingByConversation[conversationId] : undefined,
  );
  const typingUsers = typingUsersRecord || {};
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // In-chat search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(messageSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [messageSearchQuery]);

  const sendMessage = useSendMessage(conversationId || '');
  const deleteMessage = useDeleteMessage(conversationId || '');
  const editMessage = useEditMessage(conversationId || '');
  const { addReaction, removeReaction } = useMessageReactions(conversationId || '');

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useMessages(
    conversationId || '',
    debouncedSearchQuery,
  );

  const currentUser = useSession((s) => s.user);
  const queryClient = useQueryClient();
  const { data: conversationsData } = useConversations();
  const { data: conversationDetail } = useConversationDetails(conversationId);
  const { data: members } = useConversationMembers(conversationId);

  const { pin, unpin, isLoading: isPinLoading } = usePinConversation();
  const { mute, unmute, isLoading: isMuteLoading } = useMuteConversation();
  const { archive, unarchive, isLoading: isArchiveLoading } = useArchiveConversation();

  const conversation =
    conversationDetail ||
    conversationsData?.pages.flatMap((p) => p.items).find((c) => c.id === conversationId);
  const isGroup = conversation?.type === 'GROUP';

  const currentMember = members?.find((m) => m.userId === currentUser?.id);
  const isPinned = currentMember?.pinnedAt != null;
  const isMuted =
    currentMember?.mutedUntil != null && new Date(currentMember.mutedUntil) > new Date();
  const isArchived = currentMember?.archivedAt != null;
  const isGroupAdmin = currentMember?.role === 'OWNER' || currentMember?.role === 'ADMIN';

  // Target member for read receipts in direct messages
  const targetMember = members?.find((m) => m.userId !== currentUser?.id);

  // Clear live messages & reset state when changing conversations
  useEffect(() => {
    setLiveMessages([]);
    setIsProfileSidebarOpen(false);
    setReplyingTo(null);
    setEditingMessageId(null);
    setIsSearchOpen(false);
    setMessageSearchQuery('');
    setIsAttachmentMenuOpen(false);
    setPendingAttachmentFile(null);
    setIsWindowDragOver(false);
    setIsVoiceRecording(false);
    setIsVoiceUploading(false);
  }, [conversationId]);

  // Close attachment menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(e.target as Node)) {
        setIsAttachmentMenuOpen(false);
      }
    };
    if (isAttachmentMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAttachmentMenuOpen]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleIncomingMessage = (rawMsg: any) => {
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

      // Intercept typing events
      if (msg.type === 'TYPING' || msg.isTyping || msg.action === 'TYPING') {
        const uid = msg.userId || msg.senderId;
        if (uid && uid !== currentUser?.id && conversationId) {
          useTypingStore.getState().setTyping(conversationId, {
            userId: uid,
            username: msg.username,
            isTyping: true,
          });
        }
        return;
      }

      const targetId = msg.conversationId || msg.groupId || msg.chatId;

      if (!targetId || targetId === conversationId) {
        const normalizedMsg: Message = {
          ...msg,
          id: msg.id || msg.messageId || crypto.randomUUID(),
          conversationId: targetId || conversationId || '',
          content: msg.content != null ? msg.content || msg.text || msg.message || '' : null,
          senderId: msg.senderId || msg.sender_id || msg.userId || '',
          senderUsername: msg.senderUsername || null,
          senderDisplayName: msg.senderDisplayName || null,
          createdAt:
            msg.createdAt ||
            msg.timestamp ||
            msg.created_at ||
            msg.sentAt ||
            new Date().toISOString(),
          type: msg.type || 'TEXT',
          clientMessageId: msg.clientMessageId || null,
          replyToId: msg.replyToId || null,
          replyTo: msg.replyTo || null,
          reactions: msg.reactions || [],
          editedAt: msg.editedAt || null,
          deletedAt: msg.deletedAt || null,
          deleted: !!msg.deleted || msg.deletedAt != null,
          seq: typeof msg.seq === 'number' && msg.seq < 1000000000 ? msg.seq : 0,
        };

        setLiveMessages((prev) => {
          const index = prev.findIndex(
            (m) =>
              m.id === normalizedMsg.id ||
              (normalizedMsg.clientMessageId &&
                m.clientMessageId === normalizedMsg.clientMessageId),
          );
          if (index !== -1) {
            const next = [...prev];
            next[index] = normalizedMsg;
            return next;
          }
          return [normalizedMsg, ...prev];
        });
      }

      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    };

    const cleanupMessages = wsService.subscribe(
      `/topic/conversations.${conversationId}`,
      handleIncomingMessage,
    );

    const cleanupUserQueue = wsService.addMessageListener(handleIncomingMessage);

    const cleanupTypingSub = wsService.subscribe(
      `/topic/conversations.${conversationId}.typing`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rawMsg: any) => {
        const msg = rawMsg.payload || rawMsg;
        const uid = msg.userId || msg.senderId || 'typing';

        if (
          uid === currentUser?.id ||
          (currentUser?.username && msg.username === currentUser.username)
        ) {
          return;
        }

        if (conversationId) {
          useTypingStore.getState().setTyping(conversationId, {
            userId: uid,
            username: msg.username,
            isTyping: !!msg.isTyping,
          });
        }
      },
    );

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

    const cleanupErrors = wsService.addErrorListener((err) => {
      toast.error('Chat Error', {
        description: err.message || 'An error occurred during real-time messaging',
        duration: 5000,
      });
    });

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

  // Stop typing indicator on conversation switch or unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (conversationId) {
        wsService.sendChatTyping(conversationId, false);
      }
    };
  }, [conversationId]);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Combine live and historical messages, deduplicating carefully
  const historicalMessages = useMemo(() => data?.pages.flatMap((p) => p.items) || [], [data]);
  const allMessagesMap = useMemo(() => {
    const map = new Map<string, Message>();
    historicalMessages.forEach((m) => {
      const key = m.id || m.clientMessageId || Math.random().toString();
      map.set(key, m);
    });
    liveMessages.forEach((m) => {
      if (m.id && map.has(m.id)) {
        map.set(m.id, { ...map.get(m.id), ...m });
        return;
      }
      if (m.clientMessageId && map.has(m.clientMessageId)) {
        map.set(m.clientMessageId, { ...map.get(m.clientMessageId), ...m });
        return;
      }
      const key = m.id || m.clientMessageId || Math.random().toString();
      const isDuplicateFallback = Array.from(map.values()).some(
        (existing) =>
          existing.senderId === m.senderId &&
          existing.content === m.content &&
          Math.abs(new Date(existing.createdAt).getTime() - new Date(m.createdAt).getTime()) < 5000,
      );
      if (!map.has(key) && !isDuplicateFallback) {
        map.set(key, m);
      }
    });
    return map;
  }, [historicalMessages, liveMessages]);

  const allMessages = useMemo(() => {
    return Array.from(allMessagesMap.values()).sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : Date.now();
      return timeB - timeA;
    });
  }, [allMessagesMap]);

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
      targetMember?.userId ||
      usernameMatchedUser?.id ||
      allMessages.find((m) => m.senderId && m.senderId !== currentUser?.id)?.senderId ||
      (conversation?.createdBy && conversation.createdBy !== currentUser?.id
        ? conversation.createdBy
        : undefined)
    : undefined;

  const { data: targetUserProfile, isLoading: isTargetUserLoading } = useUserById(otherUserId);

  const headerName = isGroup
    ? conversation?.title || 'Group Conversation'
    : conversation?.targetDisplayName ||
      conversation?.targetUsername ||
      targetUserProfile?.displayName ||
      targetUserProfile?.username ||
      'Direct Message';

  const headerAvatar = isGroup
    ? conversation?.avatarUrl
    : conversation?.targetAvatarUrl ||
      targetUserProfile?.profilePictureUrl ||
      conversation?.avatarUrl;

  const headerInitials = (headerName || 'U').substring(0, 2).toUpperCase();

  const isUserTyping = otherUserId && typingUsers[otherUserId];

  const headerSubtitle = isGroup
    ? `${members?.length || 0} members`
    : isUserTyping
      ? 'typing...'
      : targetUserProfile?.username
        ? `@${targetUserProfile.username}${targetUserProfile.region ? ` · ${targetUserProfile.region}` : ''}`
        : conversation?.targetUsername
          ? `@${conversation.targetUsername}`
          : 'Click to view profile';

  // Sending text message
  const handleSend = () => {
    if (!content.trim() || !conversationId) return;

    const optimisticId = crypto.randomUUID();
    const replyId = replyingTo?.id || null;

    const optimisticMsg: Message = {
      id: optimisticId,
      conversationId,
      senderId: currentUser?.id || '',
      seq: 0,
      clientMessageId: optimisticId,
      type: 'TEXT',
      content: content.trim(),
      replyToId: replyId,
      createdAt: new Date().toISOString(),
      editedAt: null,
      deletedAt: null,
    };

    setLiveMessages((prev) => [optimisticMsg, ...prev]);
    setContent('');
    setReplyingTo(null);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (conversationId) {
      wsService.sendChatTyping(conversationId, false);
    }

    const sentViaWs = wsService.sendChatMessage({
      conversationId,
      clientMessageId: optimisticId,
      content: content.trim(),
      type: 'TEXT',
      replyToId: replyId,
    });

    if (!sentViaWs) {
      sendMessage.mutate({
        content: content.trim(),
        type: 'TEXT',
        clientMessageId: optimisticId,
        replyToId: replyId,
      });
    }
  };

  // Quick file picked from internal storage via hidden file inputs
  const handleQuickFilePicked = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingAttachmentFile(file);
      setIsAttachmentModalOpen(true);
      setIsAttachmentMenuOpen(false);
    }
    e.target.value = '';
  };

  // Drag and drop files from desktop/storage onto conversation
  const handleChatDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isWindowDragOver) setIsWindowDragOver(true);
  };

  const handleChatDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsWindowDragOver(false);
  };

  const handleChatDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWindowDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setPendingAttachmentFile(file);
      setIsAttachmentModalOpen(true);
    }
  };

  // Paste image / file from clipboard / storage
  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          setPendingAttachmentFile(file);
          setIsAttachmentModalOpen(true);
          return;
        }
      }
    }
  };

  // Sending image or file attachment
  const handleSendAttachment = (type: MessageType, url: string, caption?: string) => {
    if (!conversationId) return;
    const optimisticId = crypto.randomUUID();
    const finalContent = caption ? `${url}\n${caption}` : url;
    const replyId = replyingTo?.id || null;

    const optimisticMsg: Message = {
      id: optimisticId,
      conversationId,
      senderId: currentUser?.id || '',
      seq: 0,
      clientMessageId: optimisticId,
      type,
      content: finalContent,
      replyToId: replyId,
      createdAt: new Date().toISOString(),
      editedAt: null,
      deletedAt: null,
    };

    setLiveMessages((prev) => [optimisticMsg, ...prev]);
    setReplyingTo(null);

    const sentViaWs = wsService.sendChatMessage({
      conversationId,
      clientMessageId: optimisticId,
      content: finalContent,
      type,
      replyToId: replyId,
    });

    if (!sentViaWs) {
      sendMessage.mutate({
        content: finalContent,
        type,
        clientMessageId: optimisticId,
        replyToId: replyId,
      });
    }
  };

  // Sending voice message
  const handleSendVoiceMessage = async (audioFile: File) => {
    if (!conversationId) return;

    setIsVoiceUploading(true);
    try {
      const confirmData = await mediaApi.uploadFile(audioFile);
      const optimisticId = crypto.randomUUID();
      const replyId = replyingTo?.id || null;

      const optimisticMsg: Message = {
        id: optimisticId,
        conversationId,
        senderId: currentUser?.id || '',
        seq: 0,
        clientMessageId: optimisticId,
        type: 'VOICE',
        content: confirmData.url,
        replyToId: replyId,
        createdAt: new Date().toISOString(),
        editedAt: null,
        deletedAt: null,
      };

      setLiveMessages((prev) => [optimisticMsg, ...prev]);
      setReplyingTo(null);
      setIsVoiceRecording(false);

      const sentViaWs = wsService.sendChatMessage({
        conversationId,
        clientMessageId: optimisticId,
        content: confirmData.url,
        type: 'VOICE',
        replyToId: replyId,
      });

      if (!sentViaWs) {
        sendMessage.mutate({
          content: confirmData.url,
          type: 'VOICE',
          clientMessageId: optimisticId,
          replyToId: replyId,
        });
      }
    } catch (err: unknown) {
      showApiError(err, 'Failed to upload voice message');
    } finally {
      setIsVoiceUploading(false);
    }
  };

  // Save edited message
  const handleSaveEdit = (messageId: string) => {
    if (!editingContent.trim() || !conversationId) return;

    editMessage.mutate(
      {
        messageId,
        content: editingContent.trim(),
        conversationId,
      },
      {
        onSuccess: (updated) => {
          setEditingMessageId(null);
          setEditingContent('');
          setLiveMessages((prev) =>
            prev.map((m) =>
              m.id === messageId
                ? { ...m, content: updated.content, editedAt: updated.editedAt }
                : m,
            ),
          );
        },
      },
    );
  };

  // Reactions toggle
  const handleToggleReaction = (messageId: string, emoji: string) => {
    if (!currentUser?.id || !conversationId) return;

    // Check if user already reacted
    const targetMsg = allMessagesMap.get(messageId);
    let hasReacted = false;
    if (targetMsg?.reactions && Array.isArray(targetMsg.reactions)) {
      const match = targetMsg.reactions.find((r) => r.emoji === emoji);
      hasReacted = !!match?.users.some((u) => u.id === currentUser.id);
    } else if (reactionsState[messageId]?.[emoji]?.includes(currentUser.id)) {
      hasReacted = true;
    }

    if (hasReacted) {
      removeReaction({ messageId, emoji, conversationId });
      setReactionsState((prev) => {
        const msgR = { ...(prev[messageId] || {}) };
        msgR[emoji] = (msgR[emoji] || []).filter((id) => id !== currentUser.id);
        if (msgR[emoji].length === 0) delete msgR[emoji];
        return { ...prev, [messageId]: msgR };
      });
      // Optimistic reaction update
      setLiveMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId || !Array.isArray(m.reactions)) return m;
          const updated = m.reactions
            .map((r) => {
              if (r.emoji !== emoji) return r;
              const remainingUsers = r.users.filter((u) => u.id !== currentUser.id);
              return {
                ...r,
                count: remainingUsers.length,
                users: remainingUsers,
              };
            })
            .filter((r) => r.count > 0);
          return { ...m, reactions: updated };
        }),
      );
    } else {
      addReaction({ messageId, emoji, conversationId });
      setReactionsState((prev) => {
        const msgR = { ...(prev[messageId] || {}) };
        msgR[emoji] = [...(msgR[emoji] || []), currentUser.id];
        return { ...prev, [messageId]: msgR };
      });
      // Optimistic reaction update
      setLiveMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId || !Array.isArray(m.reactions)) return m;
          const existing = m.reactions.find((r) => r.emoji === emoji);
          const currentUserObj = {
            id: currentUser.id,
            username: currentUser.username || null,
            displayName: currentUser.displayName || null,
          };
          let updated;
          if (existing) {
            updated = m.reactions.map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.users.some((u) => u.id === currentUser.id) ? r.count : r.count + 1,
                    users: r.users.some((u) => u.id === currentUser.id)
                      ? r.users
                      : [...r.users, currentUserObj],
                  }
                : r,
            );
          } else {
            updated = [...m.reactions, { emoji, count: 1, users: [currentUserObj] }];
          }
          return { ...m, reactions: updated };
        }),
      );
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
    <div
      className="flex-1 flex h-full bg-white relative overflow-hidden"
      onDragOver={handleChatDragOver}
      onDragLeave={handleChatDragLeave}
      onDrop={handleChatDrop}
    >
      {/* Drag & Drop Visual Indicator */}
      {isWindowDragOver && (
        <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-xs border-2 border-dashed border-primary rounded-2xl m-3 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center text-primary mb-3">
            <UploadCloud className="w-8 h-8 animate-bounce" />
          </div>
          <p className="font-bold text-base text-primary">Drop file here to send</p>
          <p className="text-xs text-slate-600 mt-1">Image or document from your device</p>
        </div>
      )}

      {/* Main Chat Column */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white">
        <AddMembersModal
          isOpen={isAddMembersOpen}
          onClose={() => setIsAddMembersOpen(false)}
          conversationId={conversationId || ''}
        />
        <EditGroupModal
          isOpen={isEditGroupOpen}
          onClose={() => setIsEditGroupOpen(false)}
          conversationId={conversationId || ''}
          initialTitle={headerName}
          initialAvatarUrl={headerAvatar}
        />
        <AttachmentModal
          isOpen={isAttachmentModalOpen}
          onClose={() => {
            setIsAttachmentModalOpen(false);
            setPendingAttachmentFile(null);
          }}
          onSendAttachment={handleSendAttachment}
          isSending={sendMessage.isPending}
          initialFile={pendingAttachmentFile}
        />

        {/* Header */}
        <header className="h-16 border-b border-slate-100 flex items-center justify-between px-3 sm:px-6 shrink-0 bg-white">
          <div className="flex items-center min-w-0 space-x-1 sm:space-x-3">
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
              <Avatar
                src={headerAvatar}
                alt={headerName}
                className="w-10 h-10 bg-slate-100 text-slate-700 font-bold text-xs shrink-0 border border-slate-100"
                fallback={
                  isGroup && !headerAvatar ? (
                    <Users className="w-5 h-5 text-slate-500" />
                  ) : isTargetUserLoading && !headerAvatar ? (
                    <Skeleton className="w-full h-full rounded-full" />
                  ) : (
                    headerInitials
                  )
                }
              />
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 min-w-0">
                  <h2 className="font-semibold text-sm text-slate-900 group-hover/header:text-primary transition-colors truncate max-w-[130px] xs:max-w-[180px] sm:max-w-xs md:max-w-sm flex items-center gap-1.5">
                    {isTargetUserLoading && !headerName ? (
                      <Skeleton className="h-4 w-28 rounded-md" />
                    ) : (
                      <>
                        <span className="truncate">{headerName}</span>
                        {isPinned && (
                          <Pin className="w-3 h-3 text-primary fill-primary/20 shrink-0" />
                        )}
                        {isMuted && <BellOff className="w-3 h-3 text-slate-400 shrink-0" />}
                      </>
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
                  className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9 min-h-[36px] min-w-[36px] cursor-pointer"
                  title="Add members"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
                <div className="hidden sm:block w-px h-4 bg-slate-200 mx-1"></div>
              </>
            )}

            {/* In-Chat Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className={`rounded-full h-9 w-9 min-h-[36px] min-w-[36px] cursor-pointer ${
                isSearchOpen ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Search messages"
            >
              <Search className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex text-slate-400 hover:text-slate-600 rounded-full h-9 w-9 cursor-pointer"
              title="Start call"
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex text-slate-400 hover:text-slate-600 rounded-full h-9 w-9 cursor-pointer"
              title="Start video"
            >
              <Video className="w-4 h-4" />
            </Button>
            <div className="hidden sm:block w-px h-4 bg-slate-200 mx-1"></div>

            {/* Conversation Actions Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsHeaderMenuOpen((prev) => !prev)}
                className="text-slate-400 hover:text-slate-600 rounded-full h-9 w-9 min-h-[36px] min-w-[36px] cursor-pointer"
                title="Conversation actions"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {isHeaderMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsHeaderMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in zoom-in-95">
                    <button
                      type="button"
                      disabled={isPinLoading}
                      onClick={() => {
                        setIsHeaderMenuOpen(false);
                        if (conversationId) {
                          if (isPinned) unpin(conversationId);
                          else pin(conversationId);
                        }
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <Pin
                        className={`w-3.5 h-3.5 ${isPinned ? 'fill-primary text-primary' : 'text-slate-400'}`}
                      />
                      <span>{isPinned ? 'Unpin Conversation' : 'Pin Conversation'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isMuteLoading}
                      onClick={() => {
                        setIsHeaderMenuOpen(false);
                        if (conversationId) {
                          if (isMuted) {
                            unmute(conversationId);
                          } else {
                            const eightHours = new Date(
                              Date.now() + 8 * 60 * 60 * 1000,
                            ).toISOString();
                            mute({ id: conversationId, mutedUntil: eightHours });
                          }
                        }
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      {isMuted ? (
                        <>
                          <Bell className="w-3.5 h-3.5 text-slate-400" />
                          <span>Unmute Notifications</span>
                        </>
                      ) : (
                        <>
                          <BellOff className="w-3.5 h-3.5 text-slate-400" />
                          <span>Mute Notifications (8h)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isArchiveLoading}
                      onClick={() => {
                        setIsHeaderMenuOpen(false);
                        if (conversationId) {
                          if (isArchived) unarchive(conversationId);
                          else archive(conversationId);
                        }
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-medium"
                    >
                      <Archive className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isArchived ? 'Unarchive Conversation' : 'Archive Conversation'}</span>
                    </button>

                    {isGroup && isGroupAdmin && (
                      <>
                        <div className="h-px bg-slate-100 my-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setIsHeaderMenuOpen(false);
                            setIsEditGroupOpen(true);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer font-medium"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-primary" />
                          <span>Edit Group</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

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

        {/* In-Chat Message Search Bar */}
        {isSearchOpen && (
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-150 shrink-0">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <Input
              value={messageSearchQuery}
              onChange={(e) => setMessageSearchQuery(e.target.value)}
              placeholder="Search in conversation..."
              className="h-9 bg-white border-slate-200 text-xs rounded-xl flex-1"
            />
            {messageSearchQuery && (
              <button
                type="button"
                onClick={() => setMessageSearchQuery('')}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(false);
                setMessageSearchQuery('');
              }}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col-reverse gap-4 sm:gap-6 pb-4">
          {isLoading ? (
            <ChatMessagesSkeleton />
          ) : allMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
              <p className="text-sm font-medium">
                {debouncedSearchQuery ? 'No matching messages found.' : 'No messages yet.'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {debouncedSearchQuery
                  ? 'Try searching with different keywords.'
                  : 'Send a message to start the conversation!'}
              </p>
            </div>
          ) : (
            <>
              {allMessages.map((msg) => {
                const isOwn = msg.senderId === currentUser?.id;
                const isDeleted = !!msg.deleted || msg.deletedAt != null;
                const isEdited = msg.editedAt != null;
                const isEditingThis = editingMessageId === msg.id;

                const senderAvatar = isOwn
                  ? currentUser?.profilePictureUrl
                  : !isGroup
                    ? conversation?.targetAvatarUrl || targetUserProfile?.profilePictureUrl
                    : undefined;

                const senderName = isOwn
                  ? currentUser?.displayName || currentUser?.username || 'You'
                  : msg.senderDisplayName ||
                    msg.senderUsername ||
                    (!isGroup
                      ? conversation?.targetDisplayName ||
                        conversation?.targetUsername ||
                        targetUserProfile?.displayName ||
                        targetUserProfile?.username
                      : undefined) ||
                    `User ${msg.senderId.substring(0, 6)}`;

                const senderInitials = (senderName || 'U').substring(0, 2).toUpperCase();
                const color = isOwn ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-700';
                const msgDate = msg.createdAt ? new Date(msg.createdAt) : new Date();
                const time = isNaN(msgDate.getTime())
                  ? format(new Date(), 'h:mm a')
                  : format(msgDate, 'h:mm a');

                const replyInfo = msg.replyTo;
                const parentReplyMsg = msg.replyToId
                  ? allMessagesMap.get(msg.replyToId)
                  : undefined;
                const replySenderName = replyInfo
                  ? replyInfo.senderId === currentUser?.id
                    ? 'You'
                    : replyInfo.senderDisplayName || replyInfo.senderUsername || 'Reply'
                  : parentReplyMsg
                    ? parentReplyMsg.senderId === currentUser?.id
                      ? 'You'
                      : parentReplyMsg.senderDisplayName || parentReplyMsg.senderUsername || 'Reply'
                    : 'Reply';
                const replyContent = replyInfo
                  ? replyInfo.deleted
                    ? 'This message was deleted'
                    : replyInfo.content || ''
                  : parentReplyMsg
                    ? parentReplyMsg.deleted || parentReplyMsg.deletedAt != null
                      ? 'This message was deleted'
                      : parentReplyMsg.content || ''
                    : '';

                // Determine read receipt status for own message
                const isRead =
                  typeof msg.seq === 'number' &&
                  targetMember?.lastReadSeq != null &&
                  msg.seq <= targetMember.lastReadSeq;

                const localReactions = reactionsState[msg.id];
                const normalizedReactions: Array<{
                  emoji: string;
                  count: number;
                  users: Array<{
                    id: string;
                    username?: string | null;
                    displayName?: string | null;
                  }>;
                }> = Array.isArray(msg.reactions)
                  ? msg.reactions
                  : msg.reactions && typeof msg.reactions === 'object'
                    ? Object.entries(msg.reactions).map(([emoji, userIds]) => ({
                        emoji,
                        count: userIds.length,
                        users: userIds.map((id) => ({ id, username: null, displayName: null })),
                      }))
                    : localReactions
                      ? Object.entries(localReactions).map(([emoji, userIds]) => ({
                          emoji,
                          count: userIds.length,
                          users: userIds.map((id) => ({ id, username: null, displayName: null })),
                        }))
                      : [];

                return (
                  <div
                    key={msg.id}
                    className={`group flex items-start space-x-2.5 sm:space-x-3 ${
                      isOwn ? 'flex-row-reverse space-x-reverse' : ''
                    } relative`}
                  >
                    <Avatar
                      src={senderAvatar}
                      alt={senderName}
                      className={`w-8 h-8 font-bold text-xs shrink-0 mt-1 ${color}`}
                      fallback={senderInitials}
                    />

                    <div
                      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[75%]`}
                    >
                      {/* Name and time header */}
                      <div className="flex items-baseline space-x-2 mb-1">
                        <span className="text-xs font-semibold text-slate-900">{senderName}</span>
                        <span className="text-[10px] text-slate-400">{time}</span>
                        {isEdited && !isDeleted && (
                          <span className="text-[9px] text-slate-400 italic">(edited)</span>
                        )}
                      </div>

                      {/* Main Message Bubble & Action Bar */}
                      <div className="relative group/bubble flex items-center gap-1.5">
                        {/* Hover Actions Toolbar */}
                        {!isDeleted && (
                          <div
                            className={`opacity-0 group-hover/bubble:opacity-100 transition-opacity absolute -top-8 ${
                              isOwn ? 'right-0' : 'left-0'
                            } bg-white shadow-md border border-slate-200 rounded-full px-2 py-0.5 flex items-center space-x-1 z-20`}
                          >
                            {/* Quick Reactions */}
                            {QUICK_REACTION_EMOJIS.slice(0, 4).map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleToggleReaction(msg.id, emoji)}
                                className="hover:scale-125 transition-transform text-xs p-1 cursor-pointer"
                                title={`React ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}

                            <div className="w-px h-3 bg-slate-200 mx-0.5" />

                            {/* Reply button */}
                            <button
                              type="button"
                              onClick={() => setReplyingTo(msg)}
                              className="p-1 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                              title="Reply"
                            >
                              <CornerUpLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit button (own messages only) */}
                            {isOwn && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMessageId(msg.id);
                                  setEditingContent(msg.content || '');
                                }}
                                className="p-1 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                title="Edit message"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete button (own or admin) */}
                            {(isOwn || isGroupAdmin) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(msg.id)}
                                disabled={deletingId === msg.id}
                                className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                                title="Delete message"
                              >
                                {deletingId === msg.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        )}

                        {/* Bubble Content */}
                        <div
                          className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-sm break-words [overflow-wrap:anywhere] shadow-xs ${
                            isOwn
                              ? 'bg-primary text-white rounded-tr-sm'
                              : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                          }`}
                        >
                          {/* Replied Parent Message Quote */}
                          {(replyInfo || parentReplyMsg) && !isDeleted && (
                            <div
                              className={`text-[11px] mb-2 p-1.5 pl-2.5 rounded-lg border-l-2 max-w-full truncate ${
                                isOwn
                                  ? 'bg-black/10 text-white/90 border-white/60'
                                  : 'bg-slate-200/70 text-slate-700 border-primary'
                              }`}
                            >
                              <span className="font-semibold block truncate">
                                {replySenderName}
                              </span>
                              <span className="truncate block opacity-90">{replyContent}</span>
                            </div>
                          )}

                          {/* Message Body */}
                          {isDeleted ? (
                            <span className="italic opacity-70 text-xs flex items-center gap-1.5 py-0.5">
                              <Trash2 className="w-3.5 h-3.5 opacity-60" />
                              This message was deleted
                            </span>
                          ) : isEditingThis ? (
                            /* Inline Edit Mode */
                            <div className="space-y-2 py-1">
                              <textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="w-full bg-white text-slate-900 rounded-xl p-2 text-xs border border-slate-300 focus:outline-none resize-none"
                                rows={2}
                              />
                              <div className="flex justify-end space-x-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingMessageId(null)}
                                  className="text-[11px] px-2 py-1 rounded-md bg-white/20 hover:bg-white/30 text-white font-medium cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(msg.id)}
                                  disabled={editMessage.isPending}
                                  className="text-[11px] px-2.5 py-1 rounded-md bg-white text-primary font-bold hover:bg-slate-100 cursor-pointer shadow-xs"
                                >
                                  {editMessage.isPending ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            </div>
                          ) : msg.type === 'IMAGE' ? (
                            /* Image Attachment Message */
                            <div className="space-y-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewImageUrl((msg.content || '').split('\n')[0] || null)
                                }
                                className="block p-0 bg-transparent border-none cursor-pointer rounded-xl overflow-hidden hover:opacity-95 transition-opacity"
                                title="Click to view full image"
                              >
                                <img
                                  src={(msg.content || '').split('\n')[0]}
                                  alt="Shared attachment"
                                  className="max-w-xs sm:max-w-sm rounded-xl object-cover max-h-60"
                                />
                              </button>
                              {msg.content?.includes('\n') && (
                                <p className="text-xs pt-1">
                                  {msg.content.substring(msg.content.indexOf('\n') + 1)}
                                </p>
                              )}
                            </div>
                          ) : msg.type === 'VOICE' ||
                            (msg.type === 'FILE' &&
                              (msg.content || '')
                                .split('\n')[0]
                                ?.match(/\.(mp3|wav|ogg|webm|m4a|aac)(\?.*)?$/i)) ? (
                            /* Voice / Audio Message */
                            <VoiceMessagePlayer
                              audioUrl={(msg.content || '').split('\n')[0] || ''}
                              isOwn={isOwn}
                              caption={
                                msg.content?.includes('\n')
                                  ? msg.content.substring(msg.content.indexOf('\n') + 1)
                                  : null
                              }
                            />
                          ) : msg.type === 'FILE' ? (
                            /* Document / File Message */
                            (() => {
                              const [rawFileUrl, ...captionParts] = (msg.content || '').split('\n');
                              const fileUrl = rawFileUrl || '#';
                              const fileCaption = captionParts.join('\n');
                              const cleanFileName = decodeURIComponent(
                                (fileUrl.split('?')[0] || '').split('/').pop() || 'Document',
                              );

                              return (
                                <div className="space-y-1.5">
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    download={cleanFileName}
                                    className={`flex items-center space-x-2.5 p-2 rounded-xl transition-colors ${
                                      isOwn
                                        ? 'bg-white/15 hover:bg-white/25 text-white'
                                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 shadow-2xs'
                                    }`}
                                  >
                                    <FileText
                                      className={`w-6 h-6 shrink-0 ${
                                        isOwn ? 'text-white' : 'text-primary'
                                      }`}
                                    />
                                    <div className="min-w-0 pr-2">
                                      <span className="text-xs font-semibold block truncate max-w-[170px]">
                                        {cleanFileName}
                                      </span>
                                      <span className="text-[10px] opacity-75">
                                        Click to view or download
                                      </span>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 opacity-60 shrink-0" />
                                  </a>
                                  {fileCaption && (
                                    <p className="text-xs pt-0.5 px-0.5 break-words">
                                      {fileCaption}
                                    </p>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            /* Standard Text Message */
                            msg.content || ''
                          )}

                          {/* Own Read Status Icon */}
                          {isOwn && !isDeleted && (
                            <span
                              className="inline-flex items-center ml-2 float-right mt-1 opacity-80"
                              title={isRead ? 'Read' : 'Delivered'}
                            >
                              {isRead ? (
                                <CheckCheck className="w-3 h-3 text-white" />
                              ) : (
                                <Check className="w-3 h-3 text-white/70" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reactions Pill Display */}
                      {normalizedReactions.length > 0 && !isDeleted && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {normalizedReactions.map((reaction) => {
                            const hasUserReacted =
                              !!currentUser?.id &&
                              reaction.users.some((u) => u.id === currentUser.id);
                            const userNames = reaction.users
                              .map((u) =>
                                u.id === currentUser?.id
                                  ? 'You'
                                  : u.displayName || u.username || 'User',
                              )
                              .join(', ');

                            return (
                              <button
                                key={reaction.emoji}
                                type="button"
                                onClick={() => handleToggleReaction(msg.id, reaction.emoji)}
                                title={
                                  userNames
                                    ? `${reaction.emoji} by ${userNames}`
                                    : `${reaction.count} reaction${reaction.count > 1 ? 's' : ''}`
                                }
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                                  hasUserReacted
                                    ? 'bg-primary/10 border-primary/30 text-primary shadow-2xs font-bold'
                                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                <span className="mr-1">{reaction.emoji}</span>
                                <span className="text-[10px]">{reaction.count}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

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
          {/* Replying Banner */}
          {replyingTo && (
            <div className="flex items-center justify-between bg-primary/5 border border-primary/20 px-3.5 py-1.5 rounded-xl mb-2 animate-in slide-in-from-bottom-2">
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <CornerUpLeft className="w-3.5 h-3.5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-primary truncate">
                    Replying to {replyingTo.senderId === currentUser?.id ? 'yourself' : 'message'}
                  </p>
                  <p className="text-xs text-slate-600 truncate">{replyingTo.content}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded-full cursor-pointer"
                title="Cancel reply"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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
                  ? `${Object.values(typingUsers)[0]?.username || 'Someone'} is typing...`
                  : 'Several people are typing...'}
              </span>
            </div>
          )}

          {/* Input Box / Voice Recording Bar */}
          {isVoiceRecording ? (
            <VoiceRecorderBar
              onCancel={() => setIsVoiceRecording(false)}
              onSendVoice={handleSendVoiceMessage}
              isSending={isVoiceUploading}
            />
          ) : (
            <div className="flex items-end bg-slate-50 rounded-2xl border border-slate-200 p-1 pl-3 sm:pl-4 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <textarea
                className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2.5 sm:py-3 max-h-32 text-base md:text-sm focus:outline-none"
                placeholder="Write a message..."
                rows={1}
                value={content}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                disabled={sendMessage.isPending}
              />

              {/* Hidden Inputs for Direct Picking from Internal Storage */}
              <input
                ref={imageFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                className="hidden"
                onChange={handleQuickFilePicked}
              />
              <input
                ref={docFileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.json,application/*,text/*"
                className="hidden"
                onChange={handleQuickFilePicked}
              />

              <div className="flex items-center space-x-1 p-1 sm:p-2 shrink-0">
                {/* Attachment Popover & Trigger */}
                <div className="relative" ref={attachmentMenuRef}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsAttachmentMenuOpen((prev) => !prev)}
                    className={`rounded-full h-8 w-8 min-h-[36px] min-w-[36px] cursor-pointer transition-colors ${
                      isAttachmentMenuOpen
                        ? 'text-primary bg-primary/10'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Attach photo or document from internal storage"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>

                  {/* Popover Menu */}
                  {isAttachmentMenuOpen && (
                    <div className="absolute bottom-12 left-0 z-40 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 w-52 flex flex-col space-y-1 animate-in fade-in zoom-in-95 duration-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAttachmentMenuOpen(false);
                          imageFileInputRef.current?.click();
                        }}
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-colors cursor-pointer text-left w-full"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block font-medium">Photos & Videos</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Pick from device
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAttachmentMenuOpen(false);
                          docFileInputRef.current?.click();
                        }}
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-colors cursor-pointer text-left w-full"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block font-medium">Document / File</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            PDF, doc, sheet, zip
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAttachmentMenuOpen(false);
                          setIsVoiceRecording(true);
                        }}
                        className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-primary transition-colors cursor-pointer text-left w-full"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <Mic className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block font-medium">Voice Message</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Record audio note
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAttachmentMenuOpen(false);
                          setPendingAttachmentFile(null);
                          setIsAttachmentModalOpen(true);
                        }}
                        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-[11px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer text-left w-full border-t border-slate-100 mt-1"
                      >
                        <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Browse internal storage</span>
                      </button>
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setContent((prev) => `${prev} 😊`);
                  }}
                  className="text-slate-400 hover:text-slate-600 rounded-full h-8 w-8 min-h-[36px] min-w-[36px] cursor-pointer"
                  title="Add emoji"
                >
                  <Smile className="w-4 h-4" />
                </Button>

                {content.trim().length > 0 ? (
                  <Button
                    size="icon"
                    className="rounded-full h-9 w-9 min-h-[36px] min-w-[36px] bg-primary text-white hover:bg-primary/90 ml-1 sm:ml-2 shadow-sm cursor-pointer"
                    onClick={handleSend}
                    disabled={sendMessage.isPending}
                    title="Send message"
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 ml-0.5" />
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => setIsVoiceRecording(true)}
                    className="rounded-full h-9 w-9 min-h-[36px] min-w-[36px] bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all ml-1 sm:ml-2 shadow-xs cursor-pointer"
                    title="Record voice message"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
          <p className="hidden sm:block text-[10px] text-slate-400 text-center mt-2 font-medium">
            <strong>Return</strong> to send, <strong>Shift + Return</strong> for new line
          </p>
        </div>
      </div>

      {/* Side View Layout Panel for User Details */}
      {isProfileSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden animate-in fade-in duration-200"
            onClick={() => setIsProfileSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-80 lg:relative lg:inset-auto lg:w-96 lg:z-auto h-full shrink-0">
            <UserProfileSidebar
              onClose={() => setIsProfileSidebarOpen(false)}
              conversationId={conversationId}
              userId={otherUserId}
              fallbackName={headerName}
              fallbackUsername={conversation?.targetUsername || usernameMatchedUser?.username}
              fallbackAvatar={headerAvatar}
              isGroup={isGroup}
              onOpenAddMembers={() => setIsAddMembersOpen(true)}
            />
          </div>
        </>
      )}

      {/* Image Preview Lightbox Modal */}
      {previewImageUrl && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in"
        >
          <button
            type="button"
            className="fixed inset-0 w-full h-full bg-transparent cursor-default border-none p-0"
            onClick={() => setPreviewImageUrl(null)}
            aria-label="Close image preview overlay"
          />
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl z-10">
            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-3 right-3 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 p-2 rounded-full cursor-pointer z-10"
              title="Close image preview"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageUrl}
              alt="Full preview"
              className="w-full h-full object-contain max-h-[85vh] rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

function ChatMessagesSkeleton() {
  return (
    <div className="flex flex-col-reverse gap-6 w-full py-2">
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
