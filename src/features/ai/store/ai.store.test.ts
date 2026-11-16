import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAiStore } from './ai.store';
import { aiApi } from '../api/ai-api';
import { conversationsApi } from '@/features/chat';
import type { Message } from '@/features/chat';

describe('useAiStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(conversationsApi, 'getMessages').mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });
  });

  it('creates a new session and sets it as active', () => {
    const newId = useAiStore.getState().createNewSession('leo-fast');
    expect(useAiStore.getState().activeSessionId).toBe(newId);
    const session = useAiStore.getState().sessions.find((s) => s.id === newId);
    expect(session).toBeDefined();
    expect(session?.modelId).toBe('leo-fast');
  });

  it('sends prompt via aiApi.chat directly with session UUID and updates messages', async () => {
    const createGroupSpy = vi.spyOn(conversationsApi, 'createGroupMessage');

    const sessionId = useAiStore.getState().createNewSession();
    useAiStore.getState().selectSession(sessionId);

    const mockAiMessage: Message = {
      id: 'ai-resp-id',
      conversationId: sessionId,
      senderId: null,
      aiGenerated: true,
      seq: 2,
      clientMessageId: 'ai-test-client',
      type: 'TEXT',
      content: 'This is the Gemini response.',
      replyToId: null,
      createdAt: new Date().toISOString(),
      editedAt: null,
      deletedAt: null,
    };

    const chatSpy = vi.spyOn(aiApi, 'chat').mockResolvedValueOnce(mockAiMessage);

    await useAiStore.getState().sendMessage('Explain React 19');

    // ensureAiConversation on the backend handles conversation initialization;
    // client should not make extra createGroupMessage calls
    expect(createGroupSpy).not.toHaveBeenCalled();
    expect(chatSpy).toHaveBeenCalledWith({
      conversationId: sessionId,
      prompt: 'Explain React 19',
      clientMessageId: expect.any(String),
    });

    const session = useAiStore.getState().sessions.find((s) => s.id === sessionId);
    expect(session?.messages).toHaveLength(2);
    expect(session?.messages[0]?.role).toBe('user');
    expect(session?.messages[0]?.content).toBe('Explain React 19');
    expect(session?.messages[1]?.role).toBe('assistant');
    expect(session?.messages[1]?.content).toBe('This is the Gemini response.');
    expect(useAiStore.getState().isGenerating).toBe(false);
  });
});
