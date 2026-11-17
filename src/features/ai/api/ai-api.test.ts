import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiApi } from './ai-api';
import { http } from '@/shared/api/http-client';

describe('aiApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends prompt to /ai/chat and returns persisted AI message response', async () => {
    const mockResponse = {
      id: 'ai-msg-1',
      conversationId: 'conv-123',
      senderId: null,
      aiGenerated: true,
      senderUsername: null,
      senderDisplayName: 'Leo AI',
      seq: 5,
      type: 'TEXT',
      content: 'Hello! I am Leo AI assistant.',
      createdAt: '2026-11-16T18:00:00Z',
    };

    vi.spyOn(http, 'post').mockResolvedValueOnce({ data: mockResponse });

    const result = await aiApi.chat({
      conversationId: 'conv-123',
      prompt: 'Hello AI',
      clientMessageId: 'client-1',
    });

    expect(http.post).toHaveBeenCalledWith(
      '/ai/chat',
      {
        conversationId: 'conv-123',
        prompt: 'Hello AI',
        clientMessageId: 'client-1',
      },
      {
        timeout: 90_000,
      },
    );
    expect(result).toEqual(mockResponse);
  });
});
