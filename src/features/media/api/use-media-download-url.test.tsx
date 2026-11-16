import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { mediaApi } from './media-api';
import { useMediaDownloadUrl } from './use-media-download-url';

describe('useMediaDownloadUrl', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('returns fallbackUrl immediately without fetching when storageKey is not provided', () => {
    const { result } = renderHook(
      () => useMediaDownloadUrl(null, 'https://example.com/fallback.jpg'),
      {
        wrapper,
      },
    );

    expect(result.current.url).toBe('https://example.com/fallback.jpg');
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches signed download URL when storageKey is provided', async () => {
    vi.spyOn(mediaApi, 'getDownloadUrl').mockResolvedValueOnce({
      bucket: 'images',
      storageKey: 'users/user-1/sample.png',
      url: 'https://storage.example.com/signed-sample.png',
      expiresIn: 900,
    });

    const { result } = renderHook(() => useMediaDownloadUrl('users/user-1/sample.png'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.url).toBe('https://storage.example.com/signed-sample.png');
    });

    expect(mediaApi.getDownloadUrl).toHaveBeenCalledWith('users/user-1/sample.png');
    expect(result.current.isLoading).toBe(false);
  });
});
