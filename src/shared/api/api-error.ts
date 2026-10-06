export type ApiErrorBody = {
  status: number;
  code: string;
  message: string;
  path?: string;
  traceId?: string;
  errors?: { field: string; message: string }[];
};

export class ApiException extends Error {
  constructor(public readonly body: ApiErrorBody) {
    super(body.message);
  }

  get status() {
    return this.body.status;
  }

  get code() {
    return this.body.code;
  }

  get fieldErrors() {
    return this.body.errors ?? [];
  }
}

export const isApiException = (e: unknown): e is ApiException => e instanceof ApiException;

import axios from 'axios';

export function toApiException(error: unknown): ApiException {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiException({
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Cannot reach the server',
      });
    }

    const data = error.response.data as Record<string, unknown> | string;
    const status = error.response.status || 500;

    if (typeof data === 'object' && data !== null) {
      return new ApiException({
        status: (data.status as number) || status,
        code: (data.code as string) || (data.error as string) || `HTTP_${status}`,
        message: (data.message as string) || `Request failed with status code ${status}`,
        errors: data.errors as { field: string; message: string }[] | undefined,
      });
    }

    return new ApiException({
      status,
      code: `HTTP_${status}`,
      message:
        typeof data === 'string' && data.length < 200
          ? data
          : `Request failed with status code ${status}`,
    });
  }

  return new ApiException({
    status: 500,
    code: 'UNKNOWN',
    message: error instanceof Error ? error.message : 'Unexpected error',
  });
}

export function formatApiError(error: unknown, fallbackMessage = 'Operation failed'): string {
  const apiError = toApiException(error);

  const detail =
    apiError.fieldErrors.length > 0
      ? apiError.fieldErrors.map((e) => `${e.field}: ${e.message}`).join(' · ')
      : apiError.message;

  return `Error ${apiError.status}: ${detail || fallbackMessage}`;
}
