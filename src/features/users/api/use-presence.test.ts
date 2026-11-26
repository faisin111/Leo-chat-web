import { createElement, type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from '@/shared/api/http-client';
import { usersApi } from './users-api';
import { usePresence } from './use-presence';

describe('usePresence & usersApi.getPresence', () => {
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

  it('preserves real-time online boolean in usersApi.getPresence', async () => {
    vi.spyOn(http, 'get').mockResolvedValueOnce({
      data: [
        {
          userId: 'u-online',
          online: true,
          lastSeenAt: '2026-11-25T10:00:00Z',
          status: 'ACTIVE',
        },
        {
          userId: 'u-offline',
          online: false,
          lastSeenAt: new Date(Date.now() - 30_000).toISOString(),
          status: 'ACTIVE',
        },
      ],
    });

    const items = await usersApi.getPresence(['u-online', 'u-offline']);

    expect(items[0]).toMatchObject({ userId: 'u-online', online: true, status: 'ACTIVE' });
    expect(items[1]).toMatchObject({ userId: 'u-offline', online: false, status: 'ACTIVE' });
  });

  it('uses backend online boolean over lastSeenAt age and formats last seen text', async () => {
    const staleLastSeen = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const recentLastSeen = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    vi.spyOn(usersApi, 'getPresence').mockResolvedValueOnce([
      {
        userId: 'u-online-old-seen',
        id: 'u-online-old-seen',
        online: true,
        status: 'ACTIVE',
        lastSeenAt: staleLastSeen,
      },
      {
        userId: 'u-disconnected-just-now',
        id: 'u-disconnected-just-now',
        online: false,
        status: 'ACTIVE',
        lastSeenAt: recentLastSeen,
      },
      {
        userId: 'u-never-seen',
        id: 'u-never-seen',
        online: false,
        status: 'ACTIVE',
      },
    ]);

    const { result } = renderHook(
      () => usePresence(['u-online-old-seen', 'u-disconnected-just-now', 'u-never-seen']),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isOnline('u-online-old-seen')).toBe(true);
    expect(result.current.getLastSeenText('u-online-old-seen')).toBe('Active now');

    // Disconnected 2m ago must not be reported as online when online === false
    expect(result.current.isOnline('u-disconnected-just-now')).toBe(false);
    expect(result.current.getLastSeenText('u-disconnected-just-now')).toBe('Active 2m ago');

    expect(result.current.isOnline('u-never-seen')).toBe(false);
    expect(result.current.getLastSeenText('u-never-seen')).toBe('Offline');
  });
});
