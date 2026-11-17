import { http } from '@/shared/api/http-client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Message } from '@/features/chat';
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
};

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
