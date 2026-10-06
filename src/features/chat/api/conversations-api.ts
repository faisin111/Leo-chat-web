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

export const conversationsApi = {
  getConversations: async (cursor?: string | null, limit: number = 50): Promise<ConversationsResponse> => {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (limit) params.append('limit', limit.toString());
    
    // Note: User's image shows endpoint is /api/v1/conversations
    // But axios base URL in http-client is probably /api/v1 already
    // Let's assume it's just /conversations.
    const response = await http.get(`/conversations?${params.toString()}`);
    return response.data;
  },
};
