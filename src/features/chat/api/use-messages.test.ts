import { createElement, type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from '@/shared/api/http-client';
import { conversationsApi } from './conversations-api';
import { useMessages } from './use-messages';

describe('useMessages & conversationsApi.getMessages', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  it('requests message history with extended 35s timeout', async () => {
    const getSpy = vi.spyOn(http, 'get').mockResolvedValueOnce({
      data: { items: [], hasMore: false, nextCursor: null },
    });

    await conversationsApi.getMessages('conv-123');

    expect(getSpy).toHaveBeenCalledWith('/conversations/conv-123/messages?limit=25', {
      timeout: 35_000,
    });
  });

  it('fetches 25 messages per page and fails without infinite loading on error', async () => {
    const spy = vi
      .spyOn(conversationsApi, 'getMessages')
      .mockRejectedValueOnce(new Error('Request timed out'))
      .mockRejectedValueOnce(new Error('Request timed out'));

    const { result } = renderHook(() => useMessages('conv-123'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true), { timeout: 5000 });
    expect(result.current.isLoading).toBe(false);
    expect(spy).toHaveBeenCalledWith('conv-123', null, 25, null, undefined);
  });
});
