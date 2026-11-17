import { create } from 'zustand';
import { aiApi } from '../api/ai-api';
import { conversationsApi } from '@/features/chat';
import type { AiSession, AiMessage, AiModelId, AiAttachment } from '../types/ai.types';
import { toast } from 'sonner';

const STORAGE_KEY = 'leochat_ai_sessions_v2';
const ACTIVE_KEY = 'leochat_ai_active_session_v2';

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
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    if (raw && sessions.some((s) => s.id === raw)) return raw;
  } catch {
    // Ignore storage parse errors
  }
  return sessions[0]?.id || 'welcome-session';
};

const persistState = (sessions: AiSession[], activeId: string | null) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
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

  // Actions
  createNewSession: (modelId?: AiModelId) => string;
  selectSession: (id: string) => Promise<void>;
  deleteSession: (id: string) => void;
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
  clearActiveSessionMessages: () => void;
}

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
          const mapped: AiMessage[] = sorted.map((m) => ({
            id: m.id,
            role: m.aiGenerated ? 'assistant' : 'user',
            content: m.content || '',
            createdAt: m.createdAt,
            modelId: m.aiGenerated ? session.modelId : undefined,
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

  deleteSession: (id) => {
    const remaining = get().sessions.filter((s) => s.id !== id);
    const nextActiveId =
      get().activeSessionId === id ? remaining[0]?.id || null : get().activeSessionId;

    set({
      sessions: remaining,
      activeSessionId: nextActiveId,
    });
    persistState(remaining, nextActiveId);
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
    const convId: string = isValidUuid(session?.conversationId)
      ? session.conversationId
      : crypto.randomUUID();

    const clientMsgId = `ai-user-${Date.now()}`;
    const userMessage: AiMessage = {
      id: clientMsgId,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
      attachments,
    };

    // Optimistically update session with user message and conversationId
    const updatedSessions = get().sessions.map((s) => {
      if (s.id !== activeSessionId) return s;
      const isFirstMessage = s.messages.length === 0;
      const newTitle = isFirstMessage
        ? trimmed.slice(0, 36) + (trimmed.length > 36 ? '…' : '')
        : s.title;
      return {
        ...s,
        title: newTitle,
        conversationId: convId,
        updatedAt: new Date().toISOString(),
        messages: [...s.messages, userMessage],
      };
    });

    set({
      sessions: updatedSessions,
      isGenerating: true,
    });
    persistState(updatedSessions, activeSessionId);

    try {
      // Call backend Gemini AI integration directly (pure server data)
      const aiResponse = await aiApi.chat({
        conversationId: convId,
        prompt: trimmed,
        clientMessageId: clientMsgId,
      });

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
      });
      persistState(finalSessions, activeSessionId);
    } catch (err: unknown) {
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
      });
      persistState(finalSessions, activeSessionId);
    }
  },

  stopGeneration: () => {
    set({ isGenerating: false });
  },

  regenerateResponse: async (messageId: string) => {
    const { activeSessionId, sessions } = get();
    if (!activeSessionId) return;

    const session = sessions.find((s) => s.id === activeSessionId);
    const convId = session?.conversationId;
    if (!session || !isValidUuid(convId)) return;

    // Find the user message before this assistant message
    const msgIndex = session.messages.findIndex((m) => m.id === messageId);
    const userMessage = session.messages
      .slice(0, msgIndex >= 0 ? msgIndex : undefined)
      .reverse()
      .find((m) => m.role === 'user');

    if (!userMessage) return;

    set({ isGenerating: true });

    try {
      const aiResponse = await aiApi.chat({
        conversationId: convId,
        prompt: userMessage.content,
      });

      const updatedSessions = get().sessions.map((s) => {
        if (s.id !== activeSessionId) return s;
        const updated = [...s.messages];
        const targetIndex = updated.findIndex((m) => m.id === messageId);
        if (targetIndex !== -1) {
          updated[targetIndex] = {
            ...updated[targetIndex]!,
            content: aiResponse.content || '',
            createdAt: aiResponse.createdAt || new Date().toISOString(),
          };
        }
        return { ...s, messages: updated };
      });

      set({
        sessions: updatedSessions,
        isGenerating: false,
      });
      persistState(updatedSessions, activeSessionId);
    } catch (err: unknown) {
      const errMsg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { data?: { message?: string } } }).response?.data?.message
          ? (err as { response?: { data?: { message?: string } } }).response!.data!.message!
          : err instanceof Error
            ? err.message
            : 'Failed to regenerate response from server';

      toast.error(errMsg);
      set({ isGenerating: false });
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
