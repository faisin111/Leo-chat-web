import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionsPage } from './SessionsPage';
import { usersApi, type SessionItem } from '@/features/users';

const mockSessions: SessionItem[] = [
  {
    sessionId: 'session-uuid-1',
    createdAt: '2026-10-20T12:00:00Z',
    lastUsedAt: '2026-10-20T17:30:00Z',
    expiresAt: '2026-10-27T12:00:00Z',
    logoutAt: null,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    ipAddress: '192.168.1.10',
    deviceName: "John's iPhone 15",
    platform: 'ios',
    appVersion: '1.0.0',
    active: true,
  },
  {
    sessionId: 'session-uuid-2',
    createdAt: '2026-10-15T08:00:00Z',
    lastUsedAt: '2026-10-16T10:00:00Z',
    expiresAt: '2026-10-22T08:00:00Z',
    logoutAt: '2026-10-16T11:00:00Z',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    ipAddress: '203.0.113.195',
    deviceName: 'MacBook Pro',
    platform: 'macos',
    appVersion: '1.0.0',
    active: false,
  },
];

describe('SessionsPage', () => {
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

  it('renders session details with device name, platform, ip address, and active badges', async () => {
    vi.spyOn(usersApi, 'getSessions').mockResolvedValueOnce(mockSessions);

    render(
      <QueryClientProvider client={queryClient}>
        <SessionsPage />
      </QueryClientProvider>,
    );

    // Header active count
    expect(await screen.findByText('1 active')).toBeInTheDocument();

    // Session 1: John's iPhone 15
    expect(screen.getByText("John's iPhone 15")).toBeInTheDocument();
    expect(screen.getByText('192.168.1.10')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('IOS')).toBeInTheDocument();
    expect(screen.getAllByText('v1.0.0')).toHaveLength(2);

    // Session 2: MacBook Pro (Revoked / Signed out)
    expect(screen.getByText('MacBook Pro')).toBeInTheDocument();
    expect(screen.getByText('203.0.113.195')).toBeInTheDocument();
    expect(screen.getByText('Signed out')).toBeInTheDocument();
    expect(screen.getByText('MACOS')).toBeInTheDocument();
    expect(screen.getByText('Revoked')).toBeInTheDocument();
  });

  it('calls revokeSession when Sign out button is clicked on an active session', async () => {
    vi.spyOn(usersApi, 'getSessions').mockResolvedValueOnce(mockSessions);
    const revokeSpy = vi.spyOn(usersApi, 'revokeSession').mockResolvedValueOnce();

    render(
      <QueryClientProvider client={queryClient}>
        <SessionsPage />
      </QueryClientProvider>,
    );

    const signOutBtn = await screen.findByRole('button', { name: /sign out/i });
    expect(signOutBtn).toBeInTheDocument();

    fireEvent.click(signOutBtn);
    await waitFor(() => {
      expect(revokeSpy).toHaveBeenCalledWith('session-uuid-1');
    });
  });
});
