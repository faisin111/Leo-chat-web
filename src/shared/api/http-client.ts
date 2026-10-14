import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { useSession } from '@/features/auth';
import { authSession } from '@/features/auth';
import { toApiException } from './api-error';

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  if (!csrfPromise) {
    csrfPromise = axios
      .get<{ headerName?: string; token: string }>(`${env.API_BASE_URL}/api/v1/auth/csrf`, {
        withCredentials: true,
      })
      .then((res) => {
        csrfToken = res.data?.token || '';
        return csrfToken;
      })
      .catch((err) => {
        csrfToken = null;
        throw err;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }
  return csrfPromise;
}

export function clearCsrfToken() {
  csrfToken = null;
}

export const http = axios.create({
  baseURL: `${env.API_BASE_URL}/api/v1`,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isAuthUrl = (url?: string) => !!url && /\/auth\/(login|register|refresh|csrf)/.test(url);

http.interceptors.request.use(async (config) => {
  const token = useSession.getState().accessToken;
  if (token && !isAuthUrl(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const method = config.method?.toLowerCase();
  const isWriteMethod =
    method === 'post' || method === 'patch' || method === 'put' || method === 'delete';

  if (isWriteMethod && !config.url?.includes('/auth/csrf')) {
    try {
      const csrf = await getCsrfToken();
      if (csrf) {
        config.headers['X-XSRF-TOKEN'] = csrf;
      }
    } catch {
      // Continue to let server return proper error response
    }
  }

  return config;
});

let refreshing: Promise<string> | null = null;

http.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;

    if (error.response?.status === 403) {
      clearCsrfToken();
    }

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
        if (token) {
          original.headers.Authorization = `Bearer ${token}`;
        }
        return http(original);
      } catch {
        authSession.expire();
      }
    }
    throw toApiException(error);
  },
);
