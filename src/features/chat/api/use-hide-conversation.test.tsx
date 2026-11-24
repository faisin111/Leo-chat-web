import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { conversationsApi } from './conversations-api';
import { useHideConversation } from './use-hide-conversation';

describe('useHideConversation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('hides a conversation and invalidates relevant queries', async () => {
    const hideSpy = vi.spyOn(conversationsApi, 'hideConversations').mockResolvedValueOnce(1);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useHideConversation(), { wrapper });

    await act(async () => {
      await result.current.hideAsync({
        scope: 'CONVERSATION',
        conversationId: 'conv-123',
      });
    });

    expect(hideSpy).toHaveBeenCalledWith({
      scope: 'CONVERSATION',
      conversationId: 'conv-123',
    });
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['conversations'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['unreadCount'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['conversation', 'conv-123'] });
    });
  });

  it('unhides a conversation and invalidates relevant queries', async () => {
    const unhideSpy = vi.spyOn(conversationsApi, 'unhideConversations').mockResolvedValueOnce(1);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useHideConversation(), { wrapper });

    await act(async () => {
      await result.current.unhideAsync({
        scope: 'USER',
        userId: 'user-456',
      });
    });

    expect(unhideSpy).toHaveBeenCalledWith({
      scope: 'USER',
      userId: 'user-456',
    });
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['conversations'] });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['unreadCount'] });
    });
  });
});
