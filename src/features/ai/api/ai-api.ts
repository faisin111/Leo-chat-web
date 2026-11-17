import { http } from '@/shared/api/http-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Message, Conversation } from '@/features/chat';
import type { AiActionRequest, AiActionResponse } from '../types/ai.types';
import { showApiError } from '@/shared/api/api-error';

export type AiChatRequest = {
  conversationId: string;
  prompt: string;
  clientMessageId?: string;
};

export const aiApi = {
  chat: async (data: AiChatRequest): Promise<Message> => {
    const response = await http.post('/ai/chat', data, {
      timeout: 90_000,
    });
    return response.data;
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
