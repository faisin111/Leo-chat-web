export const qk = {
  me: ['me'] as const,
  users: {
    search: (q: string) => ['users', 'search', q] as const,
    detail: (id: string) => ['users', id] as const,
    sessions: ['users', 'me', 'sessions'] as const,
    blocks: ['users', 'me', 'blocks'] as const,
    presence: (ids: string[]) => ['users', 'presence', [...ids].sort()] as const,
  },
  conversations: {
    all: ['conversations'] as const,
    list: () => ['conversations', 'list'] as const,
    detail: (id: string) => ['conversations', id] as const,
    members: (id: string) => ['conversations', id, 'members'] as const,
    unread: ['conversations', 'unread-count'] as const,
  },
  messages: {
    list: (conversationId: string) => ['messages', conversationId] as const,
  },
  admin: {
    stats: ['admin', 'stats'] as const,
    users: (filters: object) => ['admin', 'users', filters] as const,
    reports: (filters: object) => ['admin', 'reports', filters] as const,
    audit: (filters: object) => ['admin', 'audit', filters] as const,
  },
};
