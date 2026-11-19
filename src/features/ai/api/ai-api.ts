import { http } from '@/shared/api/http-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Message, Conversation } from '@/features/chat';
import type { AiActionRequest, AiActionResponse } from '../types/ai.types';
import { showApiError } from '@/shared/api/api-error';

export type AiGenerationOptions = {
  /** Client model id: leo-ultra | leo-reasoner | leo-coder | leo-fast */
  model?: string;
  reasoning?: boolean;
  webSearch?: boolean;
};

export type AiChatRequest = AiGenerationOptions & {
  conversationId: string;
  /** Saved as the user's message (max 4000 chars). May be empty when attachments are sent. */
  prompt: string;
  clientMessageId?: string;
  /** Text files sent to the model for this turn only; the server stores just their names. */
  attachments?: { name: string; text: string }[];
};

export type AiRegenerateRequest = AiGenerationOptions & {
  conversationId: string;
  /** Server id of the AI answer to replace. */
  messageId: string;
};

const AI_TIMEOUT_MS = 90_000;

export const aiApi = {
  chat: async (data: AiChatRequest, options?: { signal?: AbortSignal }): Promise<Message> => {
    const response = await http.post('/ai/chat', data, {
      timeout: AI_TIMEOUT_MS,
      ...(options?.signal ? { signal: options.signal } : {}),
    });
    return response.data;
  },

  regenerate: async (
    data: AiRegenerateRequest,
    options?: { signal?: AbortSignal },
  ): Promise<Message> => {
    const response = await http.post('/ai/chat/regenerate', data, {
      timeout: AI_TIMEOUT_MS,
      ...(options?.signal ? { signal: options.signal } : {}),
    });
    return response.data;
  },

  listConversations: async (): Promise<Conversation[]> => {
    const response = await http.get('/ai/conversations');
    return response.data;
  },

  deleteConversationById: async (conversationId: string): Promise<void> => {
    await http.delete(`/ai/conversations/${conversationId}`);
  },

  getOrCreateConversation: async (): Promise<Conversation> => {
    const response = await http.post('/ai/conversation');
    return response.data;
  },

  deleteConversation: async (): Promise<void> => {
    await http.delete('/ai/conversation');
  },

  executeAction: async <T = unknown>(data: AiActionRequest): Promise<AiActionResponse<T>> => {
    const response = await http.post('/ai/actions', data);
    return response.data;
  },
};

export function useAiConversation() {
  return useQuery({
    queryKey: ['ai-conversation'],
    queryFn: () => aiApi.getOrCreateConversation(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteAiConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aiApi.deleteConversation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversation'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: Error) => {
      showApiError(error, 'Failed to delete AI conversation');
    },
  });
}

export function useAiAction() {
  return useMutation({
    mutationFn: (request: AiActionRequest) => aiApi.executeAction(request),
    onError: (error: Error) => {
      showApiError(error, 'Failed to execute AI action');
    },
  });
}

export function useAiChat(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<AiChatRequest, 'conversationId'>) =>
      aiApi.chat({ ...data, conversationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: Error) => {
      showApiError(error, 'Failed to ask Leo AI');
    },
  });
}
