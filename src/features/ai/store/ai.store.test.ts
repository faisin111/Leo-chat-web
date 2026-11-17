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

  it('initializes server AI conversation via initServerConversation', async () => {
    vi.spyOn(aiApi, 'getOrCreateConversation').mockResolvedValueOnce({
      id: 'server-ai-uuid',
      type: 'AI',
      title: 'LeoChat AI',
      createdBy: 'user-1',
      lastSeq: 0,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      avatarUrl: null,
      directKey: 'ai:user-1',
      lastMessageAt: null,
    });

    const convId = await useAiStore.getState().initServerConversation();
    expect(convId).toBe('server-ai-uuid');
    expect(useAiStore.getState().serverConversationId).toBe('server-ai-uuid');
  });

  it('permanently deletes server AI conversation via deleteServerConversation', async () => {
    const deleteSpy = vi.spyOn(aiApi, 'deleteConversation').mockResolvedValueOnce();

    await useAiStore.getState().deleteServerConversation();
    expect(deleteSpy).toHaveBeenCalled();
  });
});
