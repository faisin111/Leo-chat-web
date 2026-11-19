import { create } from 'zustand';
import { aiApi } from '../api/ai-api';
import { conversationsApi } from '@/features/chat';
import type { Message } from '@/features/chat';
import { ApiException } from '@/shared/api/api-error';
import { useSession } from '@/features/auth';
import type { AiSession, AiMessage, AiModelId, AiAttachment } from '../types/ai.types';
import { toast } from 'sonner';

// AI history is stored per user so a different account on the same browser
// never sees another user's conversations. Nothing is persisted while signed out.
const STORAGE_PREFIX = 'leochat_ai_sessions_v2';
const ACTIVE_PREFIX = 'leochat_ai_active_session_v2';
// Pre-scoping keys were shared by every account on the browser; drop them.
const LEGACY_KEYS = [STORAGE_PREFIX, ACTIVE_PREFIX];

let storageOwnerId: string | null = useSession.getState().user?.id ?? null;

const storageKey = (ownerId: string) => `${STORAGE_PREFIX}:${ownerId}`;
const activeKey = (ownerId: string) => `${ACTIVE_PREFIX}:${ownerId}`;

try {
  LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
} catch {
  // Ignore storage access errors
}

const isValidUuid = (id?: string | null): id is string => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

const createDefaultSession = (): AiSession => {
  const convId = crypto.randomUUID();
  return {
    id: 'session-' + Date.now(),
    conversationId: convId,
    title: 'New Conversation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    modelId: 'leo-ultra',
    isPinned: false,
    messages: [],
  };
};

const loadInitialSessions = (): AiSession[] => {
  if (!storageOwnerId) return [createDefaultSession()];
  try {
    const raw = localStorage.getItem(storageKey(storageOwnerId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((session: AiSession) => ({
          ...session,
          conversationId: isValidUuid(session.conversationId)
            ? session.conversationId
            : crypto.randomUUID(),
        }));
      }
    }
  } catch {
    // Ignore storage parse errors
  }
  return [createDefaultSession()];
};

const loadInitialActiveId = (sessions: AiSession[]): string => {
  if (!storageOwnerId) return sessions[0]?.id || 'welcome-session';
  try {
    const raw = localStorage.getItem(activeKey(storageOwnerId));
    if (raw && sessions.some((s) => s.id === raw)) return raw;
  } catch {
    // Ignore storage parse errors
  }
  return sessions[0]?.id || 'welcome-session';
};

const persistState = (sessions: AiSession[], activeId: string | null) => {
  if (!storageOwnerId) return;
  try {
    localStorage.setItem(storageKey(storageOwnerId), JSON.stringify(sessions));
    if (activeId) localStorage.setItem(activeKey(storageOwnerId), activeId);
  } catch {
    // Ignore storage quota errors
  }
};

interface AiState {
  sessions: AiSession[];
  activeSessionId: string | null;
  selectedModelId: AiModelId;
  isGenerating: boolean;
  isDeepThinkEnabled: boolean;
  isWebSearchEnabled: boolean;
  isSidebarOpen: boolean;
  serverConversationId: string | null;
  /** Session whose reply is in flight; the indicator only shows there. */
  generatingSessionId: string | null;

  // Actions
  initServerConversation: () => Promise<string | null>;
  createNewSession: (modelId?: AiModelId) => string;
  selectSession: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  renameSession: (id: string, newTitle: string) => void;
  togglePinSession: (id: string) => void;
  setModel: (modelId: AiModelId) => void;
  toggleDeepThink: () => void;
  toggleWebSearch: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  sendMessage: (content: string, attachments?: AiAttachment[]) => Promise<void>;
  stopGeneration: () => void;
  regenerateResponse: (messageId: string) => Promise<void>;
  retryPrompt: (userMessage: AiMessage) => Promise<void>;
  clearActiveSessionMessages: () => void;
}

const generationOptions = (state: {
  selectedModelId: AiModelId;
  isDeepThinkEnabled: boolean;
  isWebSearchEnabled: boolean;
}) => ({
  model: state.selectedModelId,
  reasoning: state.isDeepThinkEnabled,
  webSearch: state.isWebSearchEnabled,
});

const toAssistantMessage = (response: Message, modelId: AiModelId): AiMessage => ({
  id: response.id || `msg-ai-${Date.now()}`,
  role: 'assistant',
  modelId,
  createdAt: response.createdAt || new Date().toISOString(),
  content: response.content || '',
});

const errorMessage = (err: unknown, fallback: string) =>
  err instanceof Error && err.message ? err.message : fallback;

// One AI request at a time. Stop aborts it; a reply that arrives after Stop
// (or after a newer request started) is ignored.
let activeGeneration: AbortController | null = null;

const beginGeneration = () => {
  activeGeneration?.abort();
  activeGeneration = new AbortController();
  return activeGeneration;
};

/** Returns true if this request is still current, and releases it. */
const endGeneration = (controller: AbortController) => {
  if (controller.signal.aborted || activeGeneration !== controller) return false;
  activeGeneration = null;
  return true;
};

const initialSessions = loadInitialSessions();
const initialActiveId = loadInitialActiveId(initialSessions);

export const useAiStore = create<AiState>((set, get) => ({
  sessions: initialSessions,
  activeSessionId: initialActiveId,
  selectedModelId: 'leo-ultra',
  isGenerating: false,
  isDeepThinkEnabled: false,
  isWebSearchEnabled: true,
  isSidebarOpen: true,
  serverConversationId: null,
  generatingSessionId: null,

  // Each chat is its own server AI conversation (its conversationId). Pull in chats that
  // exist on the server but not in this browser (e.g. started on another device).
  initServerConversation: async () => {
    try {
      const serverConversations = await aiApi.listConversations();
      const { sessions, activeSessionId } = get();
      const known = new Set(sessions.map((s) => s.conversationId));
      const missing: AiSession[] = serverConversations
        .filter((c) => c.id && !known.has(c.id))
        .map((c) => ({
          ...createDefaultSession(),
          id: crypto.randomUUID(),
          conversationId: c.id,
          title: c.title && c.title !== 'LeoChat AI' ? c.title : 'Earlier conversation',
          createdAt: c.createdAt,
          updatedAt: c.lastMessageAt || c.createdAt,
        }));

      let nextSessions = [...sessions, ...missing];
      // Drop the placeholder empty chat if the server already has chats to show.
      const active = nextSessions.find((s) => s.id === activeSessionId);
      let nextActiveId = activeSessionId;
      if (missing.length > 0 && active && active.messages.length === 0 && sessions.length === 1) {
        nextSessions = nextSessions.filter((s) => s.id !== active.id);
        nextActiveId = missing[0]?.id ?? null;
      }
      if (missing.length > 0) {
        set({ sessions: nextSessions, activeSessionId: nextActiveId });
        persistState(nextSessions, nextActiveId);
      }
      if (nextActiveId) await get().selectSession(nextActiveId);
      return nextSessions.find((s) => s.id === nextActiveId)?.conversationId ?? null;
    } catch (err) {
      console.warn('Could not sync AI conversations from backend:', err);
    }
    return null;
  },

  createNewSession: (modelId) => {
    const newId = crypto.randomUUID();
    const targetModel = modelId || get().selectedModelId;
    const newSession: AiSession = {
      id: newId,
      conversationId: newId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modelId: targetModel,
      messages: [],
      isPinned: false,
    };

    const nextSessions = [newSession, ...get().sessions];
    set({
      sessions: nextSessions,
      activeSessionId: newId,
    });
    persistState(nextSessions, newId);

    return newId;
  },

  selectSession: async (id) => {
    set({ activeSessionId: id });
    persistState(get().sessions, id);

    const session = get().sessions.find((s) => s.id === id);
    const convId = session?.conversationId;
    if (session && isValidUuid(convId) && session.messages.length === 0) {
      try {
        const history = await conversationsApi.getMessages(convId);
        if (history.items && history.items.length > 0) {
          const sorted = [...history.items].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          // Regenerated answers are soft-deleted on the server; hide them.
          const mapped: AiMessage[] = sorted
            .filter((m) => !m.deletedAt && !m.deleted)
            .map((m) => ({
              id: m.id,
              role: m.aiGenerated ? 'assistant' : 'user',
              content: m.content || '',
              createdAt: m.createdAt,
              // The server does not store which mode produced an answer; don't guess.
              modelId: undefined,
            }));
          const updatedSessions = get().sessions.map((s) =>
            s.id === id ? { ...s, messages: mapped } : s,
          );
          set({ sessions: updatedSessions });
          persistState(updatedSessions, id);
        }
      } catch (err) {
        console.warn('Could not sync AI messages from backend:', err);
      }
    }
  },

  deleteSession: async (id) => {
    const session = get().sessions.find((s) => s.id === id);
    if (!session) return;
    if (isValidUuid(session.conversationId)) {
      try {
        await aiApi.deleteConversationById(session.conversationId);
      } catch (err) {
        // 404: the chat never reached the server (no message sent yet); remove it locally.
        if (!(err instanceof ApiException && err.status === 404)) {
          toast.error('Failed to delete AI conversation');
          return;
        }
      }
    }
    const remaining = get().sessions.filter((s) => s.id !== id);
    const nextActiveId =
      get().activeSessionId === id ? remaining[0]?.id || null : get().activeSessionId;

    set({
      sessions: remaining,
      activeSessionId: nextActiveId,
    });
    persistState(remaining, nextActiveId);
    toast.success('AI conversation deleted');
  },

  renameSession: (id, newTitle) => {
    const nextSessions = get().sessions.map((s) =>
      s.id === id ? { ...s, title: newTitle.trim() } : s,
    );
    set({ sessions: nextSessions });
    persistState(nextSessions, get().activeSessionId);
  },

  togglePinSession: (id) => {
    const nextSessions = get().sessions.map((s) =>
      s.id === id ? { ...s, isPinned: !s.isPinned } : s,
    );
    set({ sessions: nextSessions });
    persistState(nextSessions, get().activeSessionId);
  },

  setModel: (modelId) => {
    set({ selectedModelId: modelId });
    const { activeSessionId, sessions } = get();
    if (activeSessionId) {
      const nextSessions = sessions.map((s) => (s.id === activeSessionId ? { ...s, modelId } : s));
      set({ sessions: nextSessions });
      persistState(nextSessions, activeSessionId);
    }
  },

  toggleDeepThink: () => {
    set((state) => ({ isDeepThinkEnabled: !state.isDeepThinkEnabled }));
  },

  toggleWebSearch: () => {
    set((state) => ({ isWebSearchEnabled: !state.isWebSearchEnabled }));
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },

  setSidebarOpen: (isOpen) => {
    set({ isSidebarOpen: isOpen });
  },

  sendMessage: async (content: string, attachments?: AiAttachment[]) => {
    const trimmed = content.trim();
    if (!trimmed && (!attachments || attachments.length === 0)) return;

    let { activeSessionId } = get();
    const { selectedModelId } = get();

    // If no active session, create one
    if (!activeSessionId) {
      activeSessionId = get().createNewSession(selectedModelId);
    }

    const session = get().sessions.find((s) => s.id === activeSessionId);
    let convId: string = isValidUuid(session?.conversationId)
      ? session.conversationId
      : get().serverConversationId || '';

    if (!isValidUuid(convId)) {
      try {
        const serverConv = await aiApi.getOrCreateConversation();
        convId = serverConv.id;
        set({ serverConversationId: convId });
      } catch {
        convId = crypto.randomUUID();
      }
    }

    // File contents go to the model for this turn only; the server stores just the names.
    const fileTexts = (attachments ?? [])
      .filter((a): a is AiAttachment & { text: string } => typeof a.text === 'string')
      .map((a) => ({ name: a.name, text: a.text }));
    if (!trimmed && fileTexts.length === 0) return;

    const clientMsgId = `ai-user-${crypto.randomUUID()}`;
    const userMessage: AiMessage = {
      id: clientMsgId,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
      // Keep file names in history, not their contents.
      attachments: attachments?.map(({ id, name, size, type }) => ({ id, name, size, type })),
    };

    // Optimistically update session with user message and conversationId
    const updatedSessions = get().sessions.map((s) => {
      if (s.id !== activeSessionId) return s;
      const isFirstMessage = s.messages.length === 0;
      const titleSource = trimmed || attachments?.[0]?.name || 'New Conversation';
      const newTitle = isFirstMessage
        ? titleSource.slice(0, 36) + (titleSource.length > 36 ? '…' : '')
        : s.title;
      return {
        ...s,
        title: newTitle,
        conversationId: convId,
        updatedAt: new Date().toISOString(),
        messages: [...s.messages, userMessage],
      };
    });

    const controller = beginGeneration();
    set({
      sessions: updatedSessions,
      isGenerating: true,
      generatingSessionId: activeSessionId,
    });
    persistState(updatedSessions, activeSessionId);

    try {
      // Call backend Gemini AI integration directly (pure server data)
      const aiResponse = await aiApi.chat(
        {
          conversationId: convId,
          prompt: trimmed,
          clientMessageId: clientMsgId,
          ...generationOptions(get()),
          ...(fileTexts.length > 0 ? { attachments: fileTexts } : {}),
        },
        { signal: controller.signal },
      );
      // Stopped, or superseded by a newer request: drop the late reply.
      if (!endGeneration(controller)) return;

      const assistantMessage: AiMessage = {
        id: aiResponse.id || `msg-ai-${Date.now()}`,
        role: 'assistant',
        modelId: selectedModelId,
        createdAt: aiResponse.createdAt || new Date().toISOString(),
        content: aiResponse.content || '',
      };

      const finalSessions = get().sessions.map((s) => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          updatedAt: new Date().toISOString(),
          messages: [...s.messages, assistantMessage],
        };
      });

      set({
        sessions: finalSessions,
        isGenerating: false,
        generatingSessionId: null,
      });
      persistState(finalSessions, activeSessionId);
    } catch (err: unknown) {
      if (!endGeneration(controller)) return;
      const errMsg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
          : err instanceof Error
            ? err.message
            : 'AI assistant is not configured on the backend';

      toast.error(errMsg);

      const errorMessage: AiMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        modelId: selectedModelId,
        createdAt: new Date().toISOString(),
        content: `⚠️ **Server error:** ${errMsg}`,
      };

      const finalSessions = get().sessions.map((s) => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          updatedAt: new Date().toISOString(),
          messages: [...s.messages, errorMessage],
        };
      });

      set({
        sessions: finalSessions,
        isGenerating: false,
        generatingSessionId: null,
      });
      persistState(finalSessions, activeSessionId);
    }
  },

  stopGeneration: () => {
    activeGeneration?.abort();
    activeGeneration = null;
    set({ isGenerating: false, generatingSessionId: null });
  },

  regenerateResponse: async (messageId: string) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId || get().isGenerating) return;

    const session = sessions.find((s) => s.id === activeSessionId);
    const convId = session?.conversationId;
    if (!session || !isValidUuid(convId)) return;

    // An error placeholder was never stored on the server: resend the prompt instead.
    if (!isValidUuid(messageId)) {
      const index = session.messages.findIndex((m) => m.id === messageId);
      const userMessage = session.messages
        .slice(0, index >= 0 ? index : undefined)
        .reverse()
        .find((m) => m.role === 'user');
      if (!userMessage) return;
      const withoutError = get().sessions.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: s.messages.filter((m) => m.id !== messageId) }
          : s,
      );
      set({ sessions: withoutError });
      persistState(withoutError, activeSessionId);
      await get().retryPrompt(userMessage);
      return;
    }

    const controller = beginGeneration();
    set({ isGenerating: true, generatingSessionId: activeSessionId });

    try {
      const aiResponse = await aiApi.regenerate(
        { conversationId: convId, messageId, ...generationOptions(get()) },
        { signal: controller.signal },
      );
      if (!endGeneration(controller)) return;

      const updatedSessions = get().sessions.map((s) => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          updatedAt: new Date().toISOString(),
          messages: s.messages.map((m) =>
            m.id === messageId ? toAssistantMessage(aiResponse, get().selectedModelId) : m,
          ),
        };
      });

      set({ sessions: updatedSessions, isGenerating: false, generatingSessionId: null });
      persistState(updatedSessions, activeSessionId);
    } catch (err: unknown) {
      if (!endGeneration(controller)) return;
      toast.error(errorMessage(err, 'Failed to regenerate response from server'));
      set({ isGenerating: false, generatingSessionId: null });
    }
  },

  retryPrompt: async (userMessage: AiMessage) => {
    const { activeSessionId } = get();
    const session = get().sessions.find((s) => s.id === activeSessionId);
    const convId = session?.conversationId;
    if (!activeSessionId || !isValidUuid(convId)) return;

    const controller = beginGeneration();
    set({ isGenerating: true, generatingSessionId: activeSessionId });
    try {
      // Same clientMessageId: the server reuses the stored prompt (and answer, if any).
      const aiResponse = await aiApi.chat(
        {
          conversationId: convId,
          prompt: userMessage.content,
          clientMessageId: userMessage.id,
          ...generationOptions(get()),
        },
        { signal: controller.signal },
      );
      if (!endGeneration(controller)) return;
      const updatedSessions = get().sessions.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              updatedAt: new Date().toISOString(),
              messages: [...s.messages, toAssistantMessage(aiResponse, get().selectedModelId)],
            }
          : s,
      );
      set({ sessions: updatedSessions, isGenerating: false, generatingSessionId: null });
      persistState(updatedSessions, activeSessionId);
    } catch (err: unknown) {
      if (!endGeneration(controller)) return;
      toast.error(errorMessage(err, 'Failed to get a response from the server'));
      set({ isGenerating: false, generatingSessionId: null });
    }
  },

  clearActiveSessionMessages: () => {
    const { activeSessionId } = get();
    if (!activeSessionId) return;
    const nextSessions = get().sessions.map((s) =>
      s.id === activeSessionId ? { ...s, messages: [] } : s,
    );
    set({ sessions: nextSessions });
    persistState(nextSessions, activeSessionId);
  },
}));

// Swap AI history whenever the signed-in user changes (login, logout, expiry).
useSession.subscribe((state) => {
  const nextOwnerId = state.user?.id ?? null;
  if (nextOwnerId === storageOwnerId) return;
  storageOwnerId = nextOwnerId;
  const sessions = loadInitialSessions();
  useAiStore.setState({
    sessions,
    activeSessionId: loadInitialActiveId(sessions),
    isGenerating: false,
    generatingSessionId: null,
    serverConversationId: null,
  });
  activeGeneration?.abort();
  activeGeneration = null;
});
