import { http } from '@/shared/api/http-client';

export type Conversation = {
  id: string;
  type: string;
  title: string | null;
  avatarUrl: string | null;
  directKey: string | null;
  createdBy: string;
  lastSeq: number;
  lastMessageAt: string | null;
  createdAt: string;
  status: string;
};

export type ConversationsResponse = {
  items: Conversation[];
  hasMore: boolean;
  nextCursor: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  seq: number;
  clientMessageId: string | null;
  type: string;
  content: string;
  replyToId: string | null;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
};

export type SendMessageRequest = {
  conversationId: string;
  clientMessageId?: string;
  type?: string;
  content: string;
  replyToId?: string;
};

export type MessagesResponse = {
  items: Message[];
  hasMore: boolean;
  nextCursor: string | null;
};

export const conversationsApi = {
  getConversations: async (cursor?: string | null, limit: number = 50): Promise<ConversationsResponse> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (limit) params.append('limit', limit.toString());
    
    const response = await http.get(`/conversations?${params.toString()}`);
    return response.data;
  },
  
  startDirectMessage: async (targetUserId: string): Promise<Conversation> => {
    const response = await http.post('/conversations/direct', { targetUserId });
    return response.data;
  },

  sendMessage: async (conversationId: string, data: SendMessageRequest): Promise<Message> => {
    const response = await http.post(`/conversations/${conversationId}/messages`, data);
    return response.data;
  },

  getMessages: async (conversationId: string, beforeSeq?: string | null, limit: number = 50): Promise<MessagesResponse> => {
    const params = new URLSearchParams();
    if (beforeSeq) params.append('beforeSeq', beforeSeq);
    if (limit) params.append('limit', limit.toString());
    
    const response = await http.get(`/conversations/${conversationId}/messages?${params.toString()}`);
    return response.data;
  },
};
