import type { PropsWithChildren } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionBootstrap } from './SessionBootstrap';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: (count, err: unknown) => {
        const error = err as { status?: number };
        if (error.status && [400, 401, 403, 404, 409, 422].includes(error.status)) {
          return false;
        }
        return count < 2;
      },
    },
    mutations: { retry: false },
  },
});

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap>{children}</SessionBootstrap>
    </QueryClientProvider>
  );
}
