import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QrCodePage } from './QrCodePage';

vi.mock('@/features/auth', () => ({
  useSession: (
    selector: (s: { user: { id: string; username: string; displayName: string } }) => unknown,
  ) =>
    selector({
      user: {
        id: 'user-uuid-123',
        username: 'alice',
        displayName: 'Alice Cooper',
      },
    }),
}));

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn(),
  },
}));

describe('QrCodePage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <QrCodePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  it('renders Web QR Code header and tabs', () => {
    renderComponent();

    expect(screen.getByText('Web QR Code & Connect')).toBeInTheDocument();
    expect(screen.getByText('My Code')).toBeInTheDocument();
    expect(screen.getByText('Open in Chrome')).toBeInTheDocument();
    expect(screen.getByText('Scan Code')).toBeInTheDocument();
  });

  it('renders user details in My Code tab', () => {
    renderComponent();

    expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
    expect(screen.getByText('@alice')).toBeInTheDocument();
    expect(screen.getByText('Copy Link')).toBeInTheDocument();
  });

  it('switches to Open in Chrome tab and shows web access instructions', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Open in Chrome'));

    expect(screen.getAllByText('LeoChat Web').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Easy Web Access on Mobile or Chrome/i)).toBeInTheDocument();
  });
});
