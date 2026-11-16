import { create } from 'zustand';
import type { AiSession, AiMessage, AiModelId, AiAttachment } from '../types/ai.types';

const INITIAL_SESSIONS: AiSession[] = [
  {
    id: 'demo-session-1',
    title: 'React 19 & WebRTC Performance',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    modelId: 'leo-ultra',
    isPinned: true,
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content:
          'How can I optimize WebRTC peer connection bandwidth and media stream tracks in a React 19 application?',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'msg-2',
        role: 'assistant',
        modelId: 'leo-ultra',
        createdAt: new Date(Date.now() - 3600000 * 2 + 3000).toISOString(),
        thinkingDurationSecs: 2.8,
        thinkingContent:
          '1. Analyze WebRTC RTCPeerConnection sender parameters (encodings, maxBitrate, degradationPreference).\n2. Review React 19 concurrent features and media stream cleanup with useEffect hooks.\n3. Formulate structural recommendations: SDP bitrate munging vs. RTCRtpSender.setParameters.\n4. Draft code examples for setParameters and track lifecycle handling.',
        content: `Optimizing WebRTC media streams in modern **React 19** involves two key facets: **SDP/RTP bandwidth management** and **clean React stream lifecycle isolation**.

### 1. Optimize Video Bitrate via \`RTCRtpSender\`
Rather than munging raw SDP strings, use the modern \`RTCRtpSender.setParameters()\` API to control max bitrate and frame degradation:

\`\`\`typescript
export async function optimizeSenderBitrate(
  pc: RTCPeerConnection,
  maxBitrateBps: number = 1_500_000,
) {
  const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
  if (!videoSender) return;

  const parameters = videoSender.getParameters();
  if (!parameters.encodings || parameters.encodings.length === 0) {
    parameters.encodings = [{}];
  }

  parameters.encodings[0].maxBitrate = maxBitrateBps;
  parameters.encodings[0].degradationPreference = 'balanced'; // or 'maintain-framerate'

  await videoSender.setParameters(parameters);
}
\`\`\`

### 2. Best Practices for React 19:
- **Never store \`MediaStream\` in component state:** Store media streams in a \`useRef\` or a dedicated Zustand store to avoid unnecessary React re-renders on track events.
- **Always clean up tracks:** When component unmounts, iterate through \`stream.getTracks()\` and call \`.stop()\` immediately to release hardware camera and microphone resources.
- **Audio processing constraints:** Always pass \`{ echoCancellation: true, noiseSuppression: true, autoGainControl: true }\` to \`getUserMedia()\`.`,
        sources: [
          {
            title: 'MDN WebRTC RTCRtpSender Documentation',
            url: 'https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpSender/setParameters',
            snippet:
              'Detailed guide to controlling media stream bitrates and degradation preferences.',
          },
          {
            title: 'WebRTC.org Best Practices',
            url: 'https://webrtc.org',
            snippet: 'Official standards for peer-to-peer audio and video transmission.',
          },
        ],
      },
    ],
  },
  {
    id: 'demo-session-2',
    title: 'LeoChat 2.0 Feature Roadmap',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    modelId: 'leo-reasoner',
    isPinned: false,
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content:
          'Suggest 4 standout innovative features for our LeoChat enterprise product launch.',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'msg-4',
        role: 'assistant',
        modelId: 'leo-reasoner',
        createdAt: new Date(Date.now() - 3600000 * 24 + 4000).toISOString(),
        thinkingDurationSecs: 4.1,
        thinkingContent:
          'Brainstorming differentiated enterprise messaging features: Zero-Knowledge proofs, AI collaborative copilot, real-time speech translation, and ephemeral workspace channels.',
        content: `Here are **4 high-impact, standout features** designed to position LeoChat ahead of competitors:

1. **Native In-Chat AI Intelligence (LeoChat AI)**
   - Context-aware summaries of long group threads in 1 click.
   - Smart replies, voice-to-text transcription, and automated meeting action items.

2. **Zero-Knowledge Ephemeral Spaces**
   - Self-destructing confidential chat rooms with hardware-backed encryption keys and screenshot deterrence.

3. **Real-time Polyglot Voice & Video Translation**
   - Live translated subtitles during 1-on-1 audio/video calls using WebRTC data channels.

4. **Interactive Rich Canvas & Applets**
   - Inline poll widgets, interactive whiteboards, and lightweight code execution sandboxes directly inside the chat stream.`,
      },
    ],
  },
];

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
  selectSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, newTitle: string) => void;
  togglePinSession: (id: string) => void;
  setModel: (modelId: AiModelId) => void;
  toggleDeepThink: () => void;
  toggleWebSearch: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  sendMessage: (content: string, attachments?: AiAttachment[]) => Promise<void>;
  regenerateResponse: (messageId: string) => Promise<void>;
  clearActiveSessionMessages: () => void;
}

export const useAiStore = create<AiState>((set, get) => ({
  sessions: INITIAL_SESSIONS,
  activeSessionId: 'demo-session-1',
  selectedModelId: 'leo-ultra',
  isGenerating: false,
  isDeepThinkEnabled: false,
  isWebSearchEnabled: true,
  isSidebarOpen: true,

  createNewSession: (modelId) => {
    const newId = `session-${Date.now()}`;
    const targetModel = modelId || get().selectedModelId;
    const newSession: AiSession = {
      id: newId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modelId: targetModel,
      messages: [],
      isPinned: false,
    };

    set((state) => ({
      sessions: [newSession, ...state.sessions],
      activeSessionId: newId,
    }));

    return newId;
  },

  selectSession: (id) => {
    set({ activeSessionId: id });
  },

  deleteSession: (id) => {
    set((state) => {
      const remaining = state.sessions.filter((s) => s.id !== id);
      const nextActiveId =
        state.activeSessionId === id ? remaining[0]?.id || null : state.activeSessionId;
      return {
        sessions: remaining,
        activeSessionId: nextActiveId,
      };
    });
  },

  renameSession: (id, newTitle) => {
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, title: newTitle.trim() } : s)),
    }));
  },

  togglePinSession: (id) => {
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s)),
    }));
  },

  setModel: (modelId) => {
    set({ selectedModelId: modelId });
    // Also update active session's model if empty or active
    const { activeSessionId, sessions } = get();
    if (activeSessionId) {
      set({
        sessions: sessions.map((s) => (s.id === activeSessionId ? { ...s, modelId } : s)),
      });
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
    const { selectedModelId, isDeepThinkEnabled, isWebSearchEnabled } = get();

    // If no active session, create one
    if (!activeSessionId) {
      activeSessionId = get().createNewSession(selectedModelId);
    }

    const userMessage: AiMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
      attachments,
    };

    // Append user message
    set((state) => ({
      sessions: state.sessions.map((s) => {
        if (s.id !== activeSessionId) return s;
        const isFirstMessage = s.messages.length === 0;
        const newTitle = isFirstMessage
          ? trimmed.slice(0, 36) + (trimmed.length > 36 ? '…' : '')
          : s.title;
        return {
          ...s,
          title: newTitle,
          updatedAt: new Date().toISOString(),
          messages: [...s.messages, userMessage],
        };
      }),
      isGenerating: true,
    }));

    // Realistic Simulated Assistant Response
    const delay = isDeepThinkEnabled ? 2200 : 1200;
    await new Promise((res) => setTimeout(res, delay));

    const assistantMsgId = `msg-ai-${Date.now()}`;
    const assistantMessage: AiMessage = {
      id: assistantMsgId,
      role: 'assistant',
      modelId: selectedModelId,
      createdAt: new Date().toISOString(),
      thinkingDurationSecs: isDeepThinkEnabled ? 3.4 : undefined,
      thinkingContent: isDeepThinkEnabled
        ? `1. Parsed user request: "${trimmed}"\n2. Evaluated contextual parameters across LeoChat knowledge base.\n3. Formulated structured response with actionable code and explanations.\n4. Verified syntax, markdown formatting, and best practices.`
        : undefined,
      content: `I've analyzed your request regarding **"${trimmed}"**.

Here is a structured overview and recommendation:

- **Architecture:** Maintain clean separation of concerns and utilize atomic state primitives.
- **Performance:** Keep rendering cycles predictable with memoization where heavy compute or virtual lists are involved.
- **Security:** Ensure all data inputs are validated against strict schemas.

\`\`\`typescript
// Example snippet
export function handleAction(input: string): { success: boolean; data: string } {
  const sanitized = input.trim();
  return {
    success: sanitized.length > 0,
    data: sanitized,
  };
}
\`\`\`

Feel free to ask follow-up questions or request adjustments to this solution!`,
      sources: isWebSearchEnabled
        ? [
            {
              title: `Live Knowledge Base: ${trimmed.slice(0, 24)}`,
              url: 'https://leochat.internal/docs',
              snippet: 'Real-time contextual index retrieved from LeoChat verified sources.',
            },
          ]
        : undefined,
    };

    set((state) => ({
      sessions: state.sessions.map((s) => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          updatedAt: new Date().toISOString(),
          messages: [...s.messages, assistantMessage],
        };
      }),
      isGenerating: false,
    }));
  },

  regenerateResponse: async (messageId) => {
    const { activeSessionId } = get();
    if (!activeSessionId) return;

    set({ isGenerating: true });
    await new Promise((res) => setTimeout(res, 1200));

    set((state) => ({
      sessions: state.sessions.map((s) => {
        if (s.id !== activeSessionId) return s;
        const msgIndex = s.messages.findIndex((m) => m.id === messageId);
        if (msgIndex === -1) return s;

        const updatedMessages = [...s.messages];
        const targetMsg = updatedMessages[msgIndex];
        if (targetMsg) {
          updatedMessages[msgIndex] = {
            ...targetMsg,
            content: `${targetMsg.content}\n\n*(Regenerated with updated context)*`,
          };
        }
        return { ...s, messages: updatedMessages };
      }),
      isGenerating: false,
    }));
  },

  clearActiveSessionMessages: () => {
    const { activeSessionId } = get();
    if (!activeSessionId) return;
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === activeSessionId ? { ...s, messages: [] } : s)),
    }));
  },
}));
