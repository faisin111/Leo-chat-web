import { create } from 'zustand';

export interface TypingUserInfo {
  userId: string;
  username: string;
  timestamp: number;
}

interface TypingState {
  // conversationId -> Record<userId, TypingUserInfo>
  typingByConversation: Record<string, Record<string, TypingUserInfo>>;
  setTyping: (
    conversationId: string,
    user: { userId: string; username?: string; isTyping: boolean },
  ) => void;
  clearConversationTyping: (conversationId: string) => void;
  clearStale: (maxAgeMs?: number) => void;
}

export const useTypingStore = create<TypingState>((set) => ({
  typingByConversation: {},

  setTyping: (conversationId, { userId, username = 'Someone', isTyping }) =>
    set((state) => {
      const convTyping = { ...(state.typingByConversation[conversationId] || {}) };

      if (isTyping) {
        convTyping[userId] = {
          userId,
          username,
          timestamp: Date.now(),
        };
      } else {
        delete convTyping[userId];
      }

      if (Object.keys(convTyping).length === 0) {
        if (!state.typingByConversation[conversationId]) return state;
        const next = { ...state.typingByConversation };
        delete next[conversationId];
        return { typingByConversation: next };
      }

      return {
        typingByConversation: {
          ...state.typingByConversation,
          [conversationId]: convTyping,
        },
      };
    }),

  clearConversationTyping: (conversationId) =>
    set((state) => {
      if (!state.typingByConversation[conversationId]) return state;
      const next = { ...state.typingByConversation };
      delete next[conversationId];
      return { typingByConversation: next };
    }),

  clearStale: (maxAgeMs = 3500) =>
    set((state) => {
      const now = Date.now();
      let hasChanges = false;
      const next: Record<string, Record<string, TypingUserInfo>> = {};

      for (const [convId, users] of Object.entries(state.typingByConversation)) {
        const activeUsers: Record<string, TypingUserInfo> = {};
        for (const [uid, user] of Object.entries(users)) {
          if (now - user.timestamp < maxAgeMs) {
            activeUsers[uid] = user;
          } else {
            hasChanges = true;
          }
        }
        if (Object.keys(activeUsers).length > 0) {
          next[convId] = activeUsers;
        } else {
          hasChanges = true;
        }
      }

      return hasChanges ? { typingByConversation: next } : state;
    }),
}));
