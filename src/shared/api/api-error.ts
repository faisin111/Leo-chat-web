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
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.response?.data?.code) {
      return new ApiException(error.response.data);
    }
    if (!error.response) {
      return new ApiException({
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Cannot reach the server',
      });
    }
  }
  return new ApiException({
    status: 500,
    code: 'UNKNOWN',
    message: 'Unexpected error',
  });
}
