import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationsPage } from './NotificationsPage';
import { notificationsApi, type NotificationsPage as PageData } from '@/features/notifications';
import { useSession } from '@/features/auth';

const mockAllPage: PageData = {
  content: [
    {
      id: 'n-msg-1',
      type: 'NEW_MESSAGE',
      title: 'Alice',
      body: 'Hey, are you free for a call?',
      referenceId: 'm-1',
      conversationId: 'conv-alice',
      createdAt: '2026-11-25T13:00:00Z',
      readAt: null,
      read: false,
    },
    {
      id: 'n-react-1',
      type: 'MESSAGE_REACTION',
      title: 'Bob',
      body: 'Reacted ❤️ to your message',
      referenceId: 'm-2',
      conversationId: 'conv-bob',
      createdAt: '2026-11-25T12:30:00Z',
      readAt: '2026-11-25T12:35:00Z',
      read: true,
    },
    {
      id: 'n-call-1',
      type: 'INCOMING_CALL',
      title: 'Incoming video call',
      body: 'Charlie is calling you',
      referenceId: 'c-1',
      conversationId: 'conv-charlie',
      createdAt: '2026-11-25T12:00:00Z',
      readAt: null,
      read: false,
    },
  ],
  totalElements: 3,
  totalPages: 1,
  number: 0,
  size: 30,
  first: true,
  last: true,
  empty: false,
};

describe('NotificationsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    useSession.setState({ accessToken: 'test-token' });
    vi.restoreAllMocks();
  });

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/notifications']}>
          <Routes>
            <Route path="/app/notifications" element={<NotificationsPage />} />
            <Route path="/app/c/:conversationId" element={<div>Conversation View</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

  it('renders notifications with unread badge and filters by unread tab', async () => {
    const listSpy = vi.spyOn(notificationsApi, 'list').mockImplementation(async (params) => {
      if (params?.unreadOnly) {
        return {
          ...mockAllPage,
          content: mockAllPage.content.filter((item) => !item.read),
          totalElements: 2,
        };
      }
      return mockAllPage;
    });
    vi.spyOn(notificationsApi, 'getUnreadCount').mockResolvedValue({ unreadCount: 2 });

    renderPage();

    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Incoming video call')).toBeInTheDocument();
    expect(screen.getByText('2 unread')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Unread/i }));

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith(
        expect.objectContaining({ unreadOnly: true, page: 0, size: 30 }),
      );
    });
    await waitFor(() => {
      expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('supports mark read, mark all read, delete, and navigating to conversation on click', async () => {
    vi.spyOn(notificationsApi, 'list').mockResolvedValue(mockAllPage);
    vi.spyOn(notificationsApi, 'getUnreadCount').mockResolvedValue({ unreadCount: 2 });
    const markReadSpy = vi
      .spyOn(notificationsApi, 'markRead')
      .mockResolvedValue({ message: 'Notification marked as read' });
    const markAllSpy = vi
      .spyOn(notificationsApi, 'markAllRead')
      .mockResolvedValue({ markedRead: 2 });
    const deleteSpy = vi.spyOn(notificationsApi, 'deleteNotification').mockResolvedValue(undefined);

    renderPage();

    expect(await screen.findByText('Alice')).toBeInTheDocument();

    // Mark single unread item read via its icon button
    const markButtons = screen.getAllByRole('button', { name: 'Mark as read' });
    fireEvent.click(markButtons[0]!);
    await waitFor(() => expect(markReadSpy).toHaveBeenCalledWith('n-msg-1'));

    // Delete Bob's notification
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete notification' });
    fireEvent.click(deleteButtons[1]!);
    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith('n-react-1'));

    // Mark all read
    fireEvent.click(screen.getByRole('button', { name: /Mark all read/i }));
    await waitFor(() => expect(markAllSpy).toHaveBeenCalledTimes(1));

    // Clicking unread Incoming Call navigates to /app/c/conv-charlie and marks read
    fireEvent.click(screen.getByText('Incoming video call'));
    await waitFor(() => expect(markReadSpy).toHaveBeenCalledWith('n-call-1'));
    expect(await screen.findByText('Conversation View')).toBeInTheDocument();
  });
});
