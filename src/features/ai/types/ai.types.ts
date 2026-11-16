export type AiModelId = 'leo-ultra' | 'leo-fast' | 'leo-coder' | 'leo-reasoner';

export interface AiModelInfo {
  id: AiModelId;
  name: string;
  tagline: string;
  badge: string;
  contextWindow: string;
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
}

export interface AiMessage {
  id: string;
  role: AiMessageRole;
  content: string;
  createdAt: string;
  modelId?: AiModelId;
  thinkingContent?: string;
  thinkingDurationSecs?: number;
  sources?: AiWebSource[];
  attachments?: AiAttachment[];
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
