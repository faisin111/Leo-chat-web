import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardPage } from './DashboardPage';
import { adminApi, type AdminStatsSeriesResponse } from '@/features/admin';

const buildSeries = (days: number): AdminStatsSeriesResponse => ({
  from: '2026-11-21',
  to: '2026-11-27',
  days,
  series: {
    users: [
      { date: '2026-11-25', value: 2 },
      { date: '2026-11-26', value: 5 },
      { date: '2026-11-27', value: 3 },
    ],
    conversations: [
      { date: '2026-11-25', value: 1 },
      { date: '2026-11-26', value: 4 },
      { date: '2026-11-27', value: 2 },
    ],
    messages: [
      { date: '2026-11-25', value: 20 },
      { date: '2026-11-26', value: 45 },
      { date: '2026-11-27', value: 30 },
    ],
    reports: [
      { date: '2026-11-25', value: 0 },
      { date: '2026-11-26', value: 1 },
      { date: '2026-11-27', value: 0 },
    ],
  },
});

describe('DashboardPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.restoreAllMocks();
  });

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DashboardPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  it('renders platform activity chart and supports switching range and chart mode', async () => {
    vi.spyOn(adminApi, 'getStatsOverview').mockResolvedValue({
      totalUsers: 120,
      totalConversations: 48,
      totalReports: 2,
    });
    const tsSpy = vi
      .spyOn(adminApi, 'getStatsTimeseries')
      .mockImplementation(async (days = 30) => buildSeries(days));
    vi.spyOn(adminApi, 'getReports').mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });
    vi.spyOn(adminApi, 'getAuditLogs').mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });

    renderPage();

    expect(
      await screen.findByRole('img', { name: 'Admin platform daily activity chart' }),
    ).toBeInTheDocument();
    expect(tsSpy).toHaveBeenCalledWith(30);
    // Messages total (20 + 45 + 30 = 95)
    expect(screen.getByText('95')).toBeInTheDocument();

    // Switch chart range to 7D
    fireEvent.click(screen.getByRole('button', { name: '7D' }));
    await waitFor(() => expect(tsSpy).toHaveBeenCalledWith(7));

    // Switch from Line to Bars mode
    const barsButton = screen.getByRole('button', { name: 'Bars' });
    fireEvent.click(barsButton);
    expect(barsButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows interactive hover tooltip and replays entrance when scrolled into view', async () => {
    const observerState: { cb?: (entries: IntersectionObserverEntry[]) => void } = {};
    class MockIntersectionObserver {
      constructor(cb: (entries: IntersectionObserverEntry[]) => void) {
        observerState.cb = cb;
      }
      observe() {}
      disconnect() {}
      unobserve() {}
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    vi.spyOn(adminApi, 'getStatsOverview').mockResolvedValue({
      totalUsers: 120,
      totalConversations: 48,
      totalReports: 2,
    });
    vi.spyOn(adminApi, 'getStatsTimeseries').mockResolvedValue(buildSeries(30));
    vi.spyOn(adminApi, 'getReports').mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });
    vi.spyOn(adminApi, 'getAuditLogs').mockResolvedValue({
      items: [],
      hasMore: false,
      nextCursor: null,
    });

    const { container } = renderPage();

    const chart = await screen.findByRole('img', { name: 'Admin platform daily activity chart' });
    expect(chart).toBeInTheDocument();

    // Hover a day hit-band -> floating tooltip displays formatted date and metric value
    const hitBands = container.querySelectorAll('rect.cursor-crosshair');
    expect(hitBands.length).toBe(3);
    fireEvent.mouseEnter(hitBands[1]!);

    expect(await screen.findByText('Nov 26, 2026')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();

    // Simulate scrolling chart out of view then back into view
    act(() => {
      observerState.cb?.([{ isIntersecting: false } as IntersectionObserverEntry]);
      observerState.cb?.([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    // Chart remains mounted and interactive after scroll re-entry
    expect(
      screen.getByRole('img', { name: 'Admin platform daily activity chart' }),
    ).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
