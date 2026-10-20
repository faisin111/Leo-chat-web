import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RegisterPage } from './RegisterPage';
import { authApi, authSession, useSession } from '@/features/auth';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

describe('RegisterPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    useSession.getState().clear();
  });

  it('renders registration form fields', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('auto-logs in and redirects to /app upon successful registration', async () => {
    const markActiveSpy = vi.spyOn(authSession, 'markActive');
    const registerSpy = vi.spyOn(authApi, 'register').mockResolvedValueOnce({
      id: 'test-user-id',
      username: 'john_doe',
      displayName: 'John Doe',
      role: 'USER',
      accessToken: 'mock-access-token',
      tokenType: 'Bearer',
      refreshToken: 'mock-refresh-token',
      expiresIn: 900,
      refreshExpiresIn: 604800,
    });

    const getMeSpy = vi.spyOn(authApi, 'getMe').mockResolvedValueOnce({
      id: 'test-user-id',
      username: 'john_doe',
      displayName: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
      isEmailVerified: false,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'john_doe' } });
    fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('checkbox'));

    const submitBtn = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(registerSpy).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(markActiveSpy).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/app', { replace: true });
    });

    expect(useSession.getState().status).toBe('authenticated');
    expect(useSession.getState().accessToken).toBe('mock-access-token');
    expect(useSession.getState().user?.username).toBe('john_doe');
    expect(getMeSpy).toHaveBeenCalledWith('mock-access-token');
  });
});
