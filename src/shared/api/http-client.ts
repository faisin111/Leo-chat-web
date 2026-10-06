import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { useSession } from '@/features/auth';
import { authSession } from '@/features/auth';
import { toApiException } from './api-error';

export const http = axios.create({
  baseURL: `${env.API_BASE_URL}/api/v1`,
  timeout: 15_000,
});

http.interceptors.request.use((config) => {
  const token = useSession.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string> | null = null;
const isAuthUrl = (url?: string) => !!url && /\/auth\/(login|register|refresh)/.test(url);

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retried &&
      !isAuthUrl(original.url)
    ) {
      original._retried = true;
      try {
        refreshing ??= authSession.refresh().finally(() => {
          refreshing = null;
        });
        const token = await refreshing;
        original.headers.Authorization = `Bearer ${token}`;
        return http(original);
      } catch {
        authSession.expire();
      }
    }
    throw toApiException(error);
  },
);
