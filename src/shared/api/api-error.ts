import axios from 'axios';
import { toast } from 'sonner';

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
    this.name = 'ApiException';
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

function getStatusFallbackMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Bad request. Please check the submitted data.';
    case 401:
      return 'Session expired or unauthorized. Please sign in again.';
    case 403:
      return 'Access denied. You do not have permission for this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'Conflict: The request conflicts with existing data or server state.';
    case 422:
      return 'Business rule violation. Action cannot be completed.';
    case 429:
      return 'Too many requests. Please slow down and try again.';
    case 500:
      return 'Internal server error. Please try again later.';
    case 502:
    case 503:
    case 504:
      return 'Server is temporarily unreachable or undergoing maintenance. Please retry shortly.';
    default:
      return `Request failed with HTTP status ${status}`;
  }
}

export function toApiException(error: unknown): ApiException {
  if (isApiException(error)) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      const msg =
        error.code === 'ECONNABORTED'
          ? 'Request timed out. Please try again.'
          : 'Cannot reach the server. Please check your internet connection or backend server status.';
      return new ApiException({
        status: 0,
        code: error.code || 'NETWORK_ERROR',
        message: msg,
      });
    }

    const data = error.response.data as Record<string, unknown> | string;
    const status = error.response.status || 500;

    if (typeof data === 'object' && data !== null) {
      const backendMessage =
        (data.message as string) ||
        (data.error_description as string) ||
        (data.detail as string) ||
        (data.error as string);

      const backendErrors = Array.isArray(data.errors)
        ? (data.errors as { field: string; message: string }[])
        : undefined;

      return new ApiException({
        status: (data.status as number) || status,
        code: (data.code as string) || (data.error as string) || `HTTP_${status}`,
        message: backendMessage || getStatusFallbackMessage(status),
        path: data.path as string | undefined,
        traceId: (data.traceId || data.requestId) as string | undefined,
        errors: backendErrors,
      });
    }

    return new ApiException({
      status,
      code: `HTTP_${status}`,
      message:
        typeof data === 'string' && data.length < 300 && !data.includes('<!DOCTYPE')
          ? data
          : getStatusFallbackMessage(status),
    });
  }

  // Handle generic object with a response property (wrapped axios or mock)
  const errObj = error as {
    response?: { status?: number; data?: Record<string, unknown> | string };
    message?: string;
  };
  if (errObj && typeof errObj === 'object' && errObj.response) {
    const status = errObj.response.status || 500;
    const data = errObj.response.data;
    if (typeof data === 'object' && data !== null) {
      return new ApiException({
        status: (data.status as number) || status,
        code: (data.code as string) || (data.error as string) || `HTTP_${status}`,
        message:
          (data.message as string) || (data.error as string) || getStatusFallbackMessage(status),
        errors: data.errors as { field: string; message: string }[] | undefined,
      });
    }
    return new ApiException({
      status,
      code: `HTTP_${status}`,
      message:
        typeof data === 'string' && data.length < 300 ? data : getStatusFallbackMessage(status),
    });
  }

  return new ApiException({
    status: 500,
    code: 'UNKNOWN',
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
  });
}

export function parseApiError(
  error: unknown,
  fallbackMessage = 'Operation failed',
): {
  title: string;
  description: string;
  status: number;
} {
  const apiError = toApiException(error);
  const status = apiError.status;

  let title = fallbackMessage;
  if (status === 0) {
    title = 'Connection Error';
  } else if (status === 400) {
    title = 'Validation Failed (400)';
  } else if (status === 401) {
    title = 'Unauthorized (401)';
  } else if (status === 403) {
    title = 'Access Denied (403)';
  } else if (status === 404) {
    title = 'Not Found (404)';
  } else if (status === 409) {
    title = 'Conflict (409)';
  } else if (status === 422) {
    title = 'Request Rejected (422)';
  } else if (status === 429) {
    title = 'Rate Limited (429)';
  } else if (status >= 500) {
    title = `Server Error (${status})`;
  }

  let description = apiError.message;
  if (apiError.fieldErrors.length > 0) {
    description = apiError.fieldErrors.map((e) => `${e.field}: ${e.message}`).join(' · ');
  }

  return { title, description: description || fallbackMessage, status };
}

export function formatApiError(error: unknown, fallbackMessage = 'Operation failed'): string {
  const { title, description } = parseApiError(error, fallbackMessage);
  if (
    description &&
    description !== title &&
    !description.toLowerCase().includes(title.toLowerCase())
  ) {
    return `${title}: ${description}`;
  }
  return description || title || fallbackMessage;
}

export function showApiError(error: unknown, fallbackMessage = 'Operation failed'): void {
  const { title, description } = parseApiError(error, fallbackMessage);
  if (description && description !== title) {
    toast.error(title, {
      description,
      duration: 6000,
    });
  } else {
    toast.error(title || fallbackMessage, {
      duration: 6000,
    });
  }
}
