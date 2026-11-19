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
    expect(chatSpy).toHaveBeenCalledWith(
      {
        conversationId: sessionId,
        prompt: 'Explain React 19',
        clientMessageId: expect.any(String),
        model: 'leo-ultra',
        reasoning: false,
        webSearch: true,
      },
      { signal: expect.any(AbortSignal) },
    );

    const session = useAiStore.getState().sessions.find((s) => s.id === sessionId);
    expect(session?.messages).toHaveLength(2);
    expect(session?.messages[0]?.role).toBe('user');
    expect(session?.messages[0]?.content).toBe('Explain React 19');
    expect(session?.messages[1]?.role).toBe('assistant');
    expect(session?.messages[1]?.content).toBe('This is the Gemini response.');
    expect(useAiStore.getState().isGenerating).toBe(false);
  });

  it('handles server error without showing dummy data', async () => {
    const sessionId = useAiStore.getState().createNewSession();
    useAiStore.getState().selectSession(sessionId);

    // Mock server error
    vi.spyOn(aiApi, 'chat').mockRejectedValueOnce(
      new Error('Request timed out. Please try again.'),
    );

    await useAiStore.getState().sendMessage('give a photo');

    const session = useAiStore.getState().sessions.find((s) => s.id === sessionId);
    expect(session?.messages).toHaveLength(2);
    expect(session?.messages[0]?.role).toBe('user');
    expect(session?.messages[0]?.content).toBe('give a photo');
    expect(session?.messages[1]?.role).toBe('assistant');
    // Content must be the actual server error, never fabricated dummy data or fake photos
    expect(session?.messages[1]?.content).toContain('⚠️ **Server error:** Request timed out');
    expect(session?.messages[1]?.content).not.toContain('![Serene');
    expect(session?.messages[1]?.content).not.toContain('Unsplash');
    expect(useAiStore.getState().isGenerating).toBe(false);
  });

  it('adds server AI conversations missing from this browser on init', async () => {
    const serverId = '22222222-2222-4222-8222-222222222222';
    vi.spyOn(aiApi, 'listConversations').mockResolvedValueOnce([
      { id: serverId, title: 'LeoChat AI', createdAt: new Date().toISOString() } as never,
    ]);

    await useAiStore.getState().initServerConversation();

    const sessions = useAiStore.getState().sessions;
    expect(sessions.filter((s) => s.conversationId === serverId)).toHaveLength(1);
  });

  it('deletes a chat on the server by its conversation id', async () => {
    const sessionId = useAiStore.getState().createNewSession();
    const deleteSpy = vi.spyOn(aiApi, 'deleteConversationById').mockResolvedValueOnce();

    await useAiStore.getState().deleteSession(sessionId);

    expect(deleteSpy).toHaveBeenCalledWith(sessionId);
    expect(useAiStore.getState().sessions.some((s) => s.id === sessionId)).toBe(false);
  });

  it('regenerates through the regenerate endpoint and replaces the answer in place', async () => {
    const sessionId = useAiStore.getState().createNewSession();
    const oldAnswerId = '33333333-3333-4333-8333-333333333333';
    useAiStore.setState((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: [
                { id: 'ai-user-1', role: 'user', content: 'q', createdAt: '' },
                { id: oldAnswerId, role: 'assistant', content: 'old', createdAt: '' },
              ],
            }
          : s,
      ),
    }));
    const regenSpy = vi.spyOn(aiApi, 'regenerate').mockResolvedValueOnce({
      id: 'new-answer',
      content: 'new',
      createdAt: new Date().toISOString(),
    } as Message);

    await useAiStore.getState().regenerateResponse(oldAnswerId);

    expect(regenSpy).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: sessionId, messageId: oldAnswerId }),
      { signal: expect.any(AbortSignal) },
    );
    const messages = useAiStore.getState().sessions.find((s) => s.id === sessionId)?.messages;
    expect(messages?.map((m) => m.content)).toEqual(['q', 'new']);
  });

  it('drops a reply that arrives after Stop', async () => {
    const sessionId = useAiStore.getState().createNewSession();
    let resolveChat: (m: Message) => void = () => {};
    vi.spyOn(aiApi, 'chat').mockImplementationOnce(
      () => new Promise<Message>((resolve) => (resolveChat = resolve)),
    );

    const pending = useAiStore.getState().sendMessage('long question');
    expect(useAiStore.getState().generatingSessionId).toBe(sessionId);
    useAiStore.getState().stopGeneration();
    resolveChat({
      id: 'late',
      conversationId: sessionId,
      senderId: null,
      aiGenerated: true,
      seq: 2,
      clientMessageId: null,
      type: 'TEXT',
      content: 'late reply',
      replyToId: null,
      createdAt: new Date().toISOString(),
      editedAt: null,
      deletedAt: null,
    } as Message);
    await pending;

    const session = useAiStore.getState().sessions.find((s) => s.id === sessionId);
    expect(session?.messages.map((m) => m.content)).toEqual(['long question']);
    expect(useAiStore.getState().isGenerating).toBe(false);
  });
});
