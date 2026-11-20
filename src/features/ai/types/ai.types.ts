export type AiModelId = 'leo-ultra' | 'leo-fast' | 'leo-coder' | 'leo-reasoner';

export interface AiModelInfo {
  id: AiModelId;
  name: string;
  tagline: string;
  badge: string;
  icon: 'sparkles' | 'zap' | 'code' | 'brain';
}

export type AiMessageRole = 'user' | 'assistant' | 'system';

export interface AiWebSource {
  title: string;
  url: string;
  snippet: string;
}

export interface AiAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  /** File text sent to the AI with the prompt. Not persisted in history. */
  text?: string;
}

export interface AiActionCardData {
  id: string;
  action: AiActionType;
  status: 'pending_confirmation' | 'executing' | 'executed' | 'cancelled' | 'failed';
  targetUser?: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
  };
  conversationId?: string;
  messageText?: string;
  query?: string;
  isVideo?: boolean;
  confirmationMessage?: string;
  resultData?: unknown;
  errorMessage?: string;
}

export interface AiMessage {
  id: string;
  role: AiMessageRole;
  content: string;
  /** Full prompt sent to the server when it differs from `content` (attached files). */
  prompt?: string;
  createdAt: string;
  modelId?: AiModelId;
  thinkingContent?: string;
  thinkingDurationSecs?: number;
  sources?: AiWebSource[];
  attachments?: AiAttachment[];
  actionCard?: AiActionCardData;
}

export interface AiSession {
  id: string;
  conversationId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  modelId: AiModelId;
  messages: AiMessage[];
  isPinned?: boolean;
}

export type AiActionType =
  | 'SEARCH_USERS'
  | 'LIST_CONVERSATIONS'
  | 'GET_BLOCKED_USERS'
  | 'GET_USER'
  | 'GET_MY_PROFILE'
  | 'SEND_MESSAGE'
  | 'START_CALL';

export interface AiActionRequest {
  action: AiActionType | string;
  conversationId?: string;
  targetUserId?: string;
  message?: string;
  query?: string;
  confirmed?: boolean;
}

export interface AiActionResponse<T = unknown> {
  action: string;
  executed: boolean;
  confirmationRequired: boolean;
  message: string;
  data: T;
}
