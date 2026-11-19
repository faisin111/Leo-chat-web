import type { AiModelInfo } from '../types/ai.types';

// These are modes of the backend's Gemini assistant (see the backend's AiService), not separate
// products. Names and taglines describe only what the server actually does for each mode.
export const DEFAULT_AI_MODEL: AiModelInfo = {
  id: 'leo-ultra',
  name: 'Leo Standard',
  tagline: 'Balanced answers for everyday questions',
  badge: 'Default',
  icon: 'sparkles',
};

export const AI_MODELS: AiModelInfo[] = [
  DEFAULT_AI_MODEL,
  {
    id: 'leo-reasoner',
    name: 'Leo Reasoning',
    tagline: 'Thinks step by step before answering',
    badge: 'Reasoning',
    icon: 'brain',
  },
  {
    id: 'leo-coder',
    name: 'Leo Coder',
    tagline: 'Focused on code and technical answers',
    badge: 'Coding',
    icon: 'code',
  },
  {
    id: 'leo-fast',
    name: 'Leo Fast',
    tagline: 'Quicker replies for short tasks',
    badge: 'Fast',
    icon: 'zap',
  },
];

export const getModelById = (id?: string | null): AiModelInfo => {
  return AI_MODELS.find((m) => m.id === id) || DEFAULT_AI_MODEL;
};
