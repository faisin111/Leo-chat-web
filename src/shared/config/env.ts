import { z } from 'zod';

const schema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_WS_URL: z.string().regex(/^wss?:\/\//),
  VITE_APP_ENV: z.enum(['local', 'staging', 'prod']),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_MAX_UPLOAD_MB: z.coerce.number().default(10),
});

const parsed = schema.parse(import.meta.env);

export const env = {
  API_BASE_URL: parsed.VITE_API_BASE_URL,
  WS_URL: parsed.VITE_WS_URL,
  APP_ENV: parsed.VITE_APP_ENV,
  SENTRY_DSN: parsed.VITE_SENTRY_DSN,
  MAX_UPLOAD_MB: parsed.VITE_MAX_UPLOAD_MB,
};
