import { http } from '@/shared/api/http-client';

export type Conversation = {
  id: string;
  type: 'DIRECT' | 'GROUP' | string;
  title: string | null;
  avatarUrl: string | null;
  directKey: string | null;
  createdBy: string;
  lastSeq: number;
  lastMessageAt: string | null;
  createdAt: string;
  status: string;
  targetUserId?: string;
  targetUsername?: string;
  targetDisplayName?: string;
  targetAvatarUrl?: string;
};

export type ConversationMember = {
  conversationId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | string;
  lastReadSeq: number;
  mutedUntil: string | null;
  joinedAt: string;
  leftAt: string | null;
  pinnedAt: string | null;
  archivedAt: string | null;
};

export type ConversationsResponse = {
  items: Conversation[];
  hasMore: boolean;
  nextCursor: string | null;
};

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | string;

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  seq: number;
  clientMessageId: string | null;
  type: MessageType;
  content: string;
  replyToId: string | null;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
};

export type SendMessageRequest = {
  conversationId: string;
  clientMessageId?: string;
  type?: MessageType;
  content: string;
  replyToId?: string | null;
};

export type MessagesResponse = {
  items: Message[];
  hasMore: boolean;
  nextCursor: string | null;
};

export const conversationsApi = {
  getConversations: async (
    cursor?: string | null,
    limit: number = 50,
  ): Promise<ConversationsResponse> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (limit) params.append('limit', limit.toString());

    const response = await http.get(`/conversations?${params.toString()}`);
    return response.data;
  },

  getConversation: async (id: string): Promise<Conversation> => {
    const response = await http.get(`/conversations/${id}`);
    return response.data;
  },

  startDirectMessage: async (targetUserId: string): Promise<Conversation> => {
    const response = await http.post('/conversations/direct', { targetUserId });
    return response.data;
  },

  createGroupMessage: async (data: {
    title: string;
    memberIds: string[];
  }): Promise<Conversation> => {
    const response = await http.post('/conversations/group', data);
    return response.data;
  },

  updateConversation: async (
    id: string,
    data: { title?: string; avatarUrl?: string },
  ): Promise<Conversation> => {
    const response = await http.patch(`/conversations/${id}`, data);
    return response.data;
  },

  getMembers: async (id: string): Promise<ConversationMember[]> => {
    const response = await http.get(`/conversations/${id}/members`);
    return response.data;
  },

  addGroupMembers: async (conversationId: string, memberIds: string[]): Promise<void> => {
    await http.post(`/conversations/${conversationId}/members`, { memberIds });
  },

  removeMember: async (conversationId: string, userId: string): Promise<void> => {
    await http.delete(`/conversations/${conversationId}/members/${userId}`);
  },

  updateMemberRole: async (
    conversationId: string,
    userId: string,
    role: 'ADMIN' | 'MEMBER',
  ): Promise<void> => {
    await http.patch(`/conversations/${conversationId}/members/${userId}/role`, { role });
  },

  muteConversation: async (id: string, mutedUntil: string): Promise<void> => {
    await http.put(`/conversations/${id}/mute`, { mutedUntil });
  },

  unmuteConversation: async (id: string): Promise<void> => {
    await http.delete(`/conversations/${id}/mute`);
  },

  pinConversation: async (id: string): Promise<void> => {
    await http.put(`/conversations/${id}/pin`);
  },

  unpinConversation: async (id: string): Promise<void> => {
    await http.delete(`/conversations/${id}/pin`);
  },

  archiveConversation: async (id: string): Promise<void> => {
    await http.put(`/conversations/${id}/archive`);
  },

  unarchiveConversation: async (id: string): Promise<void> => {
    await http.delete(`/conversations/${id}/archive`);
  },

  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await http.get('/conversations/unread-count');
    return response.data;
  },

  // Messages
  getMessages: async (
    conversationId: string,
    beforeSeq?: string | null,
    limit: number = 50,
    afterSeq?: string | null,
  ): Promise<MessagesResponse> => {
    const params = new URLSearchParams();
    if (beforeSeq) params.append('beforeSeq', beforeSeq);
    if (afterSeq) params.append('afterSeq', afterSeq);
    if (limit) params.append('limit', limit.toString());

    const response = await http.get(
      `/conversations/${conversationId}/messages?${params.toString()}`,
    );
    return response.data;
  },

  sendMessage: async (conversationId: string, data: SendMessageRequest): Promise<Message> => {
    const response = await http.post(`/conversations/${conversationId}/messages`, data);
    return response.data;
  },

  markConversationRead: async (conversationId: string, upToSeq: number): Promise<void> => {
    await http.post(`/conversations/${conversationId}/read`, { upToSeq });
  },

  getMessage: async (id: string): Promise<Message> => {
    const response = await http.get(`/messages/${id}`);
    return response.data;
  },

  editMessage: async (id: string, content: string): Promise<Message> => {
    const response = await http.patch(`/messages/${id}`, { content });
    return response.data;
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await http.delete(`/messages/${messageId}`);
  },

  addReaction: async (messageId: string, emoji: string): Promise<void> => {
    await http.post(`/messages/${messageId}/reactions`, { emoji });
  },

  removeReaction: async (messageId: string, emoji: string): Promise<void> => {
    await http.delete(`/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`);
  },
};
