import type { AiModelInfo } from '../types/ai.types';

export const DEFAULT_AI_MODEL: AiModelInfo = {
  id: 'leo-ultra',
  name: 'LeoChat 4.5 Ultra',
  tagline: 'Flagship reasoning & multi-modal intelligence',
  badge: 'Default',
  contextWindow: '128k',
  icon: 'sparkles',
};

export const AI_MODELS: AiModelInfo[] = [
  DEFAULT_AI_MODEL,
  {
    id: 'leo-reasoner',
    name: 'Leo Reasoning R1',
    tagline: 'Deep chain-of-thought for science, math & logic',
    badge: 'Deep Think',
    contextWindow: '64k',
    icon: 'brain',
  },
  {
    id: 'leo-coder',
    name: 'Leo Code Architect',
    tagline: 'Expert full-stack programming, architecture & review',
    badge: 'Coding',
    contextWindow: '128k',
    icon: 'code',
  },
  {
    id: 'leo-fast',
    name: 'Leo Flash 3.5',
    tagline: 'Instant low-latency responses for quick tasks',
    badge: 'High Speed',
    contextWindow: '32k',
    icon: 'zap',
  },
];

export const getModelById = (id?: string | null): AiModelInfo => {
  return AI_MODELS.find((m) => m.id === id) || DEFAULT_AI_MODEL;
};
