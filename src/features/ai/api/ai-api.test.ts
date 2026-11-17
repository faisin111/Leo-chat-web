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

  it('gets or creates personal AI conversation via POST /ai/conversation', async () => {
    const mockConv = {
      id: 'ai-conv-uuid',
      type: 'AI',
      title: 'LeoChat AI',
      createdBy: 'user-id',
      lastSeq: 0,
      createdAt: '2026-11-17T10:00:00Z',
      status: 'ACTIVE',
    };

    vi.spyOn(http, 'post').mockResolvedValueOnce({ data: mockConv });

    const result = await aiApi.getOrCreateConversation();
    expect(http.post).toHaveBeenCalledWith('/ai/conversation');
    expect(result).toEqual(mockConv);
  });

  it('permanently deletes personal AI conversation via DELETE /ai/conversation', async () => {
    vi.spyOn(http, 'delete').mockResolvedValueOnce({ data: null });

    await aiApi.deleteConversation();
    expect(http.delete).toHaveBeenCalledWith('/ai/conversation');
  });

  it('executes AI action via POST /ai/actions', async () => {
    const mockActionResponse = {
      action: 'SEARCH_USERS',
      executed: true,
      confirmationRequired: false,
      message: 'Action completed',
      data: [{ id: 'user-1', username: 'alice' }],
    };

    vi.spyOn(http, 'post').mockResolvedValueOnce({ data: mockActionResponse });

    const result = await aiApi.executeAction({
      action: 'SEARCH_USERS',
      query: 'alice',
    });

    expect(http.post).toHaveBeenCalledWith('/ai/actions', {
      action: 'SEARCH_USERS',
      query: 'alice',
    });
    expect(result).toEqual(mockActionResponse);
  });
});
