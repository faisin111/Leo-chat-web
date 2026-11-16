import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAiStore } from './ai.store';
import { aiApi } from '../api/ai-api';
import { conversationsApi } from '@/features/chat';
import type { Message } from '@/features/chat';

describe('useAiStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('creates a new session and sets it as active', () => {
    const newId = useAiStore.getState().createNewSession('leo-fast');
    expect(useAiStore.getState().activeSessionId).toBe(newId);
    const session = useAiStore.getState().sessions.find((s) => s.id === newId);
    expect(session).toBeDefined();
    expect(session?.modelId).toBe('leo-fast');
  });

  it('sends prompt via aiApi.chat and updates messages', async () => {
    vi.spyOn(conversationsApi, 'createGroupMessage').mockResolvedValueOnce({
      id: 'backend-conv-id',
      type: 'GROUP',
      title: 'Leo AI Session',
      avatarUrl: null,
      directKey: null,
      createdBy: 'user-id',
      lastSeq: 1,
      lastMessageAt: null,
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
    });

    const mockAiMessage: Message = {
      id: 'ai-resp-id',
      conversationId: 'backend-conv-id',
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

    vi.spyOn(aiApi, 'chat').mockResolvedValueOnce(mockAiMessage);

    const sessionId = useAiStore.getState().createNewSession();
    useAiStore.getState().selectSession(sessionId);

    await useAiStore.getState().sendMessage('Explain React 19');

    const session = useAiStore.getState().sessions.find((s) => s.id === sessionId);
    expect(session?.messages).toHaveLength(2);
    expect(session?.messages[0]?.role).toBe('user');
    expect(session?.messages[0]?.content).toBe('Explain React 19');
    expect(session?.messages[1]?.role).toBe('assistant');
    expect(session?.messages[1]?.content).toBe('This is the Gemini response.');
    expect(useAiStore.getState().isGenerating).toBe(false);
  });
});
