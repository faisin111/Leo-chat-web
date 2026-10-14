import { z } from 'zod';

const cleanUrl = (url?: string) => (url ? url.trim().replace(/\/+$/, '') : '');

const getApiBaseUrl = (input?: string) => {
  const url = cleanUrl(input);
  if (url && url.startsWith('http')) return url;
  return 'https://leo-chat-backend.onrender.com';
};

const getWsUrl = (input?: string) => {
  const url = cleanUrl(input);
  if (url && url.startsWith('http')) return url;
  return 'https://leo-chat-backend.onrender.com/ws';
};

const schema = z.object({
  VITE_API_URL: z.string().optional(),
  VITE_API_BASE_URL: z.string().optional(),
  VITE_WS_URL: z.string().optional(),
  VITE_APP_ENV: z.enum(['local', 'staging', 'prod']).default('prod'),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_MAX_UPLOAD_MB: z.coerce.number().default(10),
});

const parsed = schema.parse(import.meta.env);

const apiBase = getApiBaseUrl(parsed.VITE_API_URL || parsed.VITE_API_BASE_URL);
const wsBase = getWsUrl(parsed.VITE_WS_URL);

export const env = {
  API_BASE_URL: apiBase,
  WS_URL: wsBase,
  APP_ENV: parsed.VITE_APP_ENV,
  SENTRY_DSN: parsed.VITE_SENTRY_DSN,
  MAX_UPLOAD_MB: parsed.VITE_MAX_UPLOAD_MB,
};
