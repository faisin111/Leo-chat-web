import { z } from 'zod';

const cleanUrl = (url?: string) => (url ? url.trim().replace(/\/+$/, '') : '');

// Empty = same origin ("/api/..."), served through the Vite dev proxy or the Vercel rewrite
// (vercel.json). Same-origin requests keep the HttpOnly refresh cookie first-party; calling the
// backend host directly makes it a cross-site cookie that browsers drop (SameSite=Lax), so the
// session could never be refreshed.
const getApiBaseUrl = (input?: string) => {
  const url = cleanUrl(input);
  if (url && url.startsWith('http')) return url;
  return '';
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
  // Comma-separated TURN URLs, e.g. "turn:turn.example.com:3478,turns:turn.example.com:5349"
  VITE_TURN_URLS: z.string().optional(),
  VITE_TURN_USERNAME: z.string().optional(),
  VITE_TURN_CREDENTIAL: z.string().optional(),
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
  APP_VERSION: '1.0.0',
  TURN_URLS: (parsed.VITE_TURN_URLS ?? '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean),
  TURN_USERNAME: parsed.VITE_TURN_USERNAME,
  TURN_CREDENTIAL: parsed.VITE_TURN_CREDENTIAL,
};
